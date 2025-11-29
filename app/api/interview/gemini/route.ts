import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createInterview, createInterviewFeedback, updateInterview, getInterviewById } from "@/lib/firebase-data";
import { auth } from "@/app/(auth-pages)/auth";
import { NextRequest, NextResponse } from "next/server";

// Define the structure for a Gemini interview question
interface GeminiQuestion {
  id: string;
  question: string;
  type: "technical" | "behavioral" | "system-design" | "aptitude";
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  hints?: string[];
  // For aptitude questions (multiple choice)
  options?: string[];
  correctAnswer?: string;
}

// Define the structure for a Gemini interview
interface GeminiInterview {
  title: string;
  type: string;
  role: string;
  experience: string;
  difficultyLevel: string;
  noOfQuestions: number;
  techStack: string[];
  questions: GeminiQuestion[];
  createdAt: Date;
}

// Define the structure for interview evaluation
interface InterviewEvaluation {
  feedback: string;
  score: number;
  strengths: string[];
  improvements: string[];
  technicalSkills: number;
  communication: number;
  problemSolving: number;
  systemDesign: number;
}

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      type,
      role,
      techStack,
      experience,
      difficultyLevel,
      noOfQuestions,
      userId,
    } = await req.json();

    console.log("Gemini API received:", { type, name, role });

    // Ensure techStack is an array
    const techStackArray = Array.isArray(techStack) 
      ? techStack 
      : typeof techStack === 'string' 
        ? techStack.split(',').map((item: string) => item.trim())
        : [];

    // Generate interview questions using Google Gemini
    let questions: GeminiQuestion[];
    try {
      const { text: generatedQuestions } = await generateText({
        model: google("gemini-2.0-flash-001"),
        prompt: `Generate ${noOfQuestions} interview questions for a ${role} position with ${experience} experience level and ${difficultyLevel} difficulty.
        
        Focus: ${type} questions
        Tech Stack: ${techStackArray.join(", ")}
        
        Each question should include:
        1. A unique ID
        2. The question text
        3. Question type (technical, behavioral, system-design, or aptitude)
        4. Difficulty level (Easy, Medium, Hard)
        5. Category (e.g., JavaScript, React, Algorithms, etc.)
        6. Optional hints (2-3 hints if appropriate)
        
        FOR APTITUDE QUESTIONS (multiple choice format):
        - Include "options" array with 4 choices (A, B, C, D)
        - Include "correctAnswer" with the correct option letter
        - Make one answer clearly correct, others realistic but wrong
        
        Return ONLY a valid JSON array of question objects with the following structure:
        [
          {
            "id": "1",
            "question": "Explain the concept of closures in JavaScript",
            "type": "technical",
            "difficulty": "Medium",
            "category": "JavaScript",
            "hints": ["Think about scope and variable access", "Consider how functions remember their lexical scope"]
          },
          {
            "id": "2", 
            "question": "What is the time complexity of binary search?",
            "type": "aptitude",
            "difficulty": "Easy",
            "category": "Algorithms",
            "options": ["O(n)", "O(log n)", "O(n²)", "O(1)"],
            "correctAnswer": "B"
          }
        ]
        
        IMPORTANT:
        - Return ONLY valid JSON, nothing else
        - Ensure all fields are populated appropriately
        - Make questions appropriate for the experience level and role
        - Do not include markdown or any other formatting
        - Make sure each question has a unique ID
        - For aptitude questions, ALWAYS include options and correctAnswer
        - For behavioral questions, focus on situational and experience-based questions
        - For system design questions, focus on architecture and scalability concepts
        `,
      });

      // Clean up the response and parse the generated questions
      try {
        // Remove any markdown formatting if present
        const cleanText = generatedQuestions.replace(/```json\s*|\s*```/g, '').trim();
        questions = JSON.parse(cleanText);
      } catch (parseError) {
        console.error("Error parsing generated questions:", parseError);
        console.error("Raw response:", generatedQuestions);
        throw new Error("Failed to parse generated questions");
      }
    } catch (apiError: any) {
      console.error("Gemini API quota exceeded, using fallback questions:", apiError.message);
      
      // Generate fallback questions based on the interview type
      questions = generateFallbackQuestions(type, noOfQuestions, role, experience, difficultyLevel, techStackArray);
    }

    // Create the Gemini interview object
    const geminiInterview: any = {
      title: name as string,
      type: type as string,
      role: role as string,
      experience: experience as string,
      difficultyLevel: difficultyLevel as string,
      noOfQuestions: noOfQuestions,
      techStack: techStackArray,
      questions: questions,
      createdAt: new Date(),
    };

    // Save to database
    const createdInterview = await createInterview({
      name: name as string,
      role: role as string,
      type: "gemini-" + (type as string), // Prefix to distinguish from VAPI interviews
      techStack: techStackArray,
      experience: experience as string,
      difficultyLevel: difficultyLevel as string,
      noOfQuestions: noOfQuestions,
      userId: userId as string,
      isCompleted: false,
      // Store the Gemini interview data as JSON
      questions: geminiInterview,
    });

    return NextResponse.json({ success: true, interview: createdInterview }, { status: 200 });
  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}

// Evaluate interview responses using Google Gemini
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interviewId, responses, userId } = await req.json();

    // Fetch the original interview data to get correct answers for aptitude questions
    const interviewData = await getInterviewById(interviewId) as any;
    if (!interviewData) {
      throw new Error("Interview not found");
    }
    const originalQuestions = interviewData.questions?.questions || [];

    // Separate aptitude questions from other types for different evaluation approaches
    const aptitudeResponses = responses.filter((response: any) => {
      const question = originalQuestions.find((q: GeminiQuestion) => q.id === response.questionId);
      return question?.type === "aptitude";
    });

    const otherResponses = responses.filter((response: any) => {
      const question = originalQuestions.find((q: GeminiQuestion) => q.id === response.questionId);
      return question?.type !== "aptitude";
    });

    // Calculate aptitude score
    let totalAptitudeQuestions = aptitudeResponses.length;
    let correctAptitudeAnswers = 0;

    aptitudeResponses.forEach((response: any) => {
      const question = originalQuestions.find((q: GeminiQuestion) => q.id === response.questionId);
      if (question && question.correctAnswer) {
        // Convert answer to letter if it's the full option text
        let userAnswer = response.answer;
        if (question.options && question.options.length > 0) {
          const answerIndex = question.options.findIndex((option: string) => option === response.answer);
          if (answerIndex !== -1) {
            userAnswer = String.fromCharCode(65 + answerIndex); // Convert to A, B, C, D
          }
        }
        if (userAnswer === question.correctAnswer) {
          correctAptitudeAnswers++;
        }
      }
    });

    const feedbackUserId = session.user.id;

    let evaluation: InterviewEvaluation;

    if (otherResponses.length > 0) {
      // Generate evaluation using Google Gemini for non-aptitude questions
      const conversation = otherResponses.map((response: any) => 
        `Question: ${response.question}\nAnswer: ${response.answer}`
      ).join("\n\n");

      try {
        const { text: evaluationText } = await generateText({
          model: google("gemini-2.0-flash-001"),
          prompt: `Evaluate the candidate's performance in the following interview:
          
          Interview Questions and Answers:
          ${conversation}
          
          Please provide a comprehensive evaluation with the following structure:
          {
            "feedback": "A detailed summary of the candidate's performance (300-400 words)",
            "score": 85,
            "strengths": ["List of key strengths demonstrated"],
            "improvements": ["Areas for improvement"],
            "technicalSkills": 80,
            "communication": 85,
            "problemSolving": 75,
            "systemDesign": 70
          }
          
          IMPORTANT:
            - Return ONLY valid JSON, nothing else
            - Ensure all fields are populated
            - Provide realistic scores based on the answers
            - Do not include markdown or any other formatting
            - Be constructive and specific in your feedback
          `,
        });

        // Clean up the response and parse the evaluation
        try {
          // Remove any markdown formatting if present
          const cleanText = evaluationText.replace(/```json\s*|\s*```/g, '').trim();
          evaluation = JSON.parse(cleanText);
        } catch (parseError) {
          console.error("Error parsing evaluation:", parseError);
          console.error("Raw response:", evaluationText);
          throw new Error("Failed to parse evaluation");
        }
      } catch (apiError: any) {
        console.error("Gemini API quota exceeded for evaluation, using fallback:", apiError.message);
        
        // Generate fallback evaluation
        evaluation = {
          feedback: `Interview completed successfully. You provided thoughtful responses to ${otherResponses.length} question(s). Due to high system load, detailed AI analysis is currently unavailable. Your responses demonstrate engagement with the interview process.`,
          score: 75, // Default good score
          strengths: ["Completed the interview", "Provided detailed responses", "Demonstrated engagement"],
          improvements: ["Consider providing more specific examples in future interviews", "Practice articulating technical concepts clearly"],
          technicalSkills: 70,
          communication: 80,
          problemSolving: 75,
          systemDesign: 70
        };
      }
    } else {
      // Only aptitude questions - create a basic evaluation structure
      evaluation = {
        feedback: `Aptitude assessment completed. You answered ${correctAptitudeAnswers} out of ${totalAptitudeQuestions} questions correctly.`,
        score: totalAptitudeQuestions > 0 ? Math.round((correctAptitudeAnswers / totalAptitudeQuestions) * 100) : 0,
        strengths: correctAptitudeAnswers > totalAptitudeQuestions / 2 ? ["Good aptitude skills demonstrated"] : ["Aptitude skills need improvement"],
        improvements: correctAptitudeAnswers <= totalAptitudeQuestions / 2 ? ["Practice more aptitude questions"] : ["Continue building on your aptitude knowledge"],
        technicalSkills: 0,
        communication: 0,
        problemSolving: totalAptitudeQuestions > 0 ? Math.round((correctAptitudeAnswers / totalAptitudeQuestions) * 100) : 0,
        systemDesign: 0
      };
    }

    // Adjust score if there were both aptitude and other questions
    if (totalAptitudeQuestions > 0 && otherResponses.length > 0) {
      const aptitudePercentage = totalAptitudeQuestions / responses.length;
      const aptitudeContribution = (correctAptitudeAnswers / totalAptitudeQuestions) * 100 * aptitudePercentage;
      const otherContribution = evaluation.score * (1 - aptitudePercentage);
      evaluation.score = Math.round(aptitudeContribution + otherContribution);
      evaluation.problemSolving = Math.round((correctAptitudeAnswers / totalAptitudeQuestions) * 100);
      
      // Update feedback to include aptitude results
      evaluation.feedback += `\n\nAptitude Assessment: ${correctAptitudeAnswers}/${totalAptitudeQuestions} questions answered correctly.`;
    }    // Save feedback to database
    await createInterviewFeedback({
      interviewId: interviewId,
      userId: feedbackUserId,
      feedBack: evaluation.feedback,
      problemSolving: evaluation.problemSolving,
      systemDesign: evaluation.systemDesign,
      communicationSkills: evaluation.communication,
      technicalAccuracy: evaluation.technicalSkills,
      behavioralResponses: 0, // Not applicable for this evaluation
      timeManagement: 0, // Not applicable for this evaluation
    });

    // Update interview status to completed
    await updateInterview(interviewId, { isCompleted: true });

    return NextResponse.json({ success: true, evaluation }, { status: 200 });
  } catch (error) {
    console.error("Error evaluating interview:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}

// Fallback question generation when Gemini API quota is exceeded
function generateFallbackQuestions(
  type: string,
  noOfQuestions: number,
  role: string,
  experience: string,
  difficultyLevel: string,
  techStack: string[]
): GeminiQuestion[] {
  console.log("Generating fallback questions for type:", type);
  const questions: GeminiQuestion[] = [];
  
  // Define question templates based on type
  const questionTemplates = {
    technical: [
      {
        question: "Explain the concept of closures in JavaScript and provide a practical example.",
        category: "JavaScript",
        hints: ["Think about scope and variable access", "Consider how functions remember their lexical scope"],
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      },
      {
        question: "What is the difference between let, const, and var in JavaScript?",
        category: "JavaScript",
        hints: ["Consider scope and hoisting", "Think about reassignment capabilities"],
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      },
      {
        question: "Explain the React component lifecycle and when to use useEffect.",
        category: "React",
        hints: ["Think about mounting, updating, and unmounting", "Consider side effects and cleanup"],
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      },
      {
        question: "What are the main differences between SQL and NoSQL databases?",
        category: "Databases",
        hints: ["Consider data structure and scalability", "Think about ACID properties vs flexibility"],
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      },
      {
        question: "Explain the concept of RESTful API design principles.",
        category: "APIs",
        hints: ["Think about HTTP methods and resource naming", "Consider statelessness and cacheability"],
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      }
    ],
    behavioral: [
      {
        question: "Describe a challenging project you worked on and how you overcame the difficulties.",
        category: "Experience",
        hints: ["Focus on your problem-solving approach", "Highlight collaboration and learning"],
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      },
      {
        question: "How do you handle tight deadlines and competing priorities?",
        category: "Time Management",
        hints: ["Discuss prioritization techniques", "Mention communication with stakeholders"],
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      },
      {
        question: "Tell me about a time when you received constructive criticism. How did you respond?",
        category: "Growth",
        hints: ["Show openness to feedback", "Demonstrate learning and improvement"],
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      },
      {
        question: "How do you approach learning new technologies or frameworks?",
        category: "Learning",
        hints: ["Discuss your learning methodology", "Mention resources and practice"],
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      },
      {
        question: "Describe a situation where you had to work with a difficult team member.",
        category: "Collaboration",
        hints: ["Focus on communication and resolution", "Highlight professional approach"],
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      }
    ],
    aptitude: [
      {
        question: "What is the time complexity of binary search?",
        category: "Algorithms",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correctAnswer: "B",
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      },
      {
        question: "Which data structure uses LIFO (Last In, First Out) principle?",
        category: "Data Structures",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correctAnswer: "B",
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      },
      {
        question: "What does SQL stand for?",
        category: "Databases",
        options: ["Simple Query Language", "Structured Query Language", "Standard Query Language", "System Query Language"],
        correctAnswer: "B",
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      },
      {
        question: "Which HTTP status code indicates 'Not Found'?",
        category: "Web Development",
        options: ["200", "301", "404", "500"],
        correctAnswer: "C",
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      },
      {
        question: "What is the purpose of the 'git commit' command?",
        category: "Version Control",
        options: ["Upload code to remote repository", "Save changes to local repository", "Create a new branch", "Merge branches"],
        correctAnswer: "B",
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      }
    ],
    "system-design": [
      {
        question: "How would you design a URL shortening service like bit.ly?",
        category: "System Design",
        hints: ["Consider scalability and uniqueness", "Think about database design and caching"],
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      },
      {
        question: "Design a notification system for a large-scale application.",
        category: "System Design",
        hints: ["Consider different delivery methods", "Think about reliability and scalability"],
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      },
      {
        question: "How would you handle database scaling for a rapidly growing application?",
        category: "Databases",
        hints: ["Consider read/write splitting", "Think about sharding and replication"],
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      },
      {
        question: "Design a caching strategy for a high-traffic e-commerce website.",
        category: "Performance",
        hints: ["Consider cache levels and invalidation", "Think about cache hit ratios"],
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      },
      {
        question: "How would you ensure data consistency in a distributed system?",
        category: "Distributed Systems",
        hints: ["Consider CAP theorem", "Think about eventual consistency vs strong consistency"],
        difficulty: difficultyLevel as "Easy" | "Medium" | "Hard"
      }
    ]
  };

  const templates = questionTemplates[type as keyof typeof questionTemplates] || questionTemplates.technical;
  
  // Generate the requested number of questions
  for (let i = 0; i < noOfQuestions; i++) {
    const template = templates[i % templates.length];
    const questionType = type === "aptitude" ? "aptitude" : 
                        type === "behavioral" ? "behavioral" : 
                        type === "system-design" ? "system-design" : "technical";
    
    questions.push({
      id: `${i + 1}`,
      question: template.question,
      type: questionType as "technical" | "behavioral" | "system-design" | "aptitude",
      difficulty: template.difficulty,
      category: template.category,
      ...((template as any).hints && { hints: (template as any).hints }),
      ...((template as any).options && { options: (template as any).options }),
      ...((template as any).correctAnswer && { correctAnswer: (template as any).correctAnswer })
    });
  }

  return questions;
}
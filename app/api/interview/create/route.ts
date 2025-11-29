import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { createInterview } from "@/lib/firebase-data";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const {
    name,
    type,
    role,
    techStack,
    difficultyLevel,
    experience,
    noOfQuestions,
    userId,
    company,
  } = await req.json();

  try {
    let questions: string[];
    
    try {
      const { text: GeneratedQuestions } = await generateText({
        model: google("gemini-2.0-flash-001"),
        prompt: `Prepare questions for a job interview.
            The job role is ${role}.
            The job experience Years is ${experience}.
            The tech stack used in the job is: ${techStack}.
            The Prefered Level of Difficulty is:${difficultyLevel}
            The focus between behavioural and technical questions should lean towards: ${type}.
            The amount of questions required is: ${noOfQuestions}.
            Please return only the questions, without any additional text.
            The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
            IMPORTANT:
            - Output must be a raw JSON array of strings.
            - Do NOT include any markdown, code blocks, or triple backticks.
            - Do NOT include any introductory or explanatory text.
            - Do NOT escape characters like \n or use \\.
            - Output format must be:
            ["Question 1", "Question 2", "Question 3"]

            This will be read by a voice assistant, so:
            - Avoid using any special characters like /, *, \\, backticks, or quotes inside questions.
            - Do not prefix items with numbers or dashes.
            - Output must be valid JSON, directly parsable by JSON.parse().

            Thank you! <3`,
      });

      // Clean and parse the generated questions
      let cleanQuestionsText = GeneratedQuestions.replace(/^```json\n|```$/g, "").trim();
      
      // Try to find JSON array if there's extra text
      const jsonMatch = cleanQuestionsText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanQuestionsText = jsonMatch[0];
      }
      
      questions = JSON.parse(cleanQuestionsText) as string[];
    } catch (apiError: any) {
      console.error("Gemini API quota exceeded for voice interview, using fallback questions:", apiError.message);
      
      // Generate fallback questions based on the interview type
      questions = generateFallbackVoiceQuestions(type, noOfQuestions, role, experience, difficultyLevel);
    }

    const createdInterview = await createInterview({
      name,
      role,
      type,
      techStack: techStack.split(","),
      experience,
      difficultyLevel,
      noOfQuestions,
      userId,
      isCompleted: false,
      company,
      questions,
    });

    return NextResponse.json({ success: true, id: createdInterview.id }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}

// Fallback question generation when Gemini API quota is exceeded for voice interviews
function generateFallbackVoiceQuestions(
  type: string,
  noOfQuestions: number,
  role: string,
  experience: string,
  difficultyLevel: string
): string[] {
  const questions: string[] = [];
  
  // Define question templates based on type
  const questionTemplates = {
    Technical: [
      "Can you explain the concept of closures in JavaScript and provide a practical example?",
      "What is the difference between let, const, and var in JavaScript?",
      "How does React's virtual DOM work and why is it beneficial?",
      "What are the main differences between SQL and NoSQL databases?",
      "Can you explain the concept of RESTful API design principles?",
      "What is the purpose of the useEffect hook in React?",
      "How do you handle state management in a large React application?",
      "What are the key principles of object-oriented programming?",
      "Can you explain the concept of asynchronous programming in JavaScript?",
      "What is the difference between authentication and authorization?"
    ],
    Behavioral: [
      "Can you describe a challenging project you worked on and how you overcame the difficulties?",
      "How do you handle tight deadlines and competing priorities?",
      "Tell me about a time when you received constructive criticism. How did you respond?",
      "How do you approach learning new technologies or frameworks?",
      "Can you describe a situation where you had to work with a difficult team member?",
      "How do you prioritize your tasks when working on multiple projects?",
      "Tell me about a time when you had to adapt to a significant change at work.",
      "How do you handle stress and maintain work-life balance?",
      "Can you give an example of how you mentored or helped a junior colleague?",
      "How do you stay motivated and engaged in your work?"
    ],
    "System Design": [
      "How would you design a URL shortening service like bit.ly?",
      "Can you design a notification system for a large-scale application?",
      "How would you handle database scaling for a rapidly growing application?",
      "Can you design a caching strategy for a high-traffic e-commerce website?",
      "How would you ensure data consistency in a distributed system?",
      "Can you design a rate limiting system for an API?",
      "How would you design a search system for a large dataset?",
      "Can you explain the CAP theorem and its implications?",
      "How would you design a file storage system like Google Drive?",
      "Can you design a recommendation system for an e-commerce platform?"
    ],
    Mixed: [
      "Can you explain a technical concept and then tell me about a time you applied it in a project?",
      "How do you balance technical excellence with meeting business deadlines?",
      "Can you describe a technical decision you made and the reasoning behind it?",
      "How do you communicate complex technical concepts to non-technical stakeholders?",
      "Tell me about a time when you had to choose between multiple technical solutions.",
      "How do you stay updated with the latest technology trends while delivering current projects?",
      "Can you give an example of how you handled a technical disagreement with a colleague?",
      "How do you approach debugging a complex technical issue?",
      "Tell me about a time when you had to learn a new technology quickly for a project.",
      "How do you ensure code quality while maintaining development speed?"
    ]
  };

  const templates = questionTemplates[type as keyof typeof questionTemplates] || questionTemplates.Technical;
  
  // Generate the requested number of questions
  for (let i = 0; i < noOfQuestions; i++) {
    const questionIndex = i % templates.length;
    questions.push(templates[questionIndex]);
  }

  return questions;
}

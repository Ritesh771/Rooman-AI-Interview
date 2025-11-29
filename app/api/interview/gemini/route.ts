import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createInterview, createInterviewFeedback, updateInterview } from "@/lib/firebase-data";
import { auth } from "@/app/(auth-pages)/auth";
import { NextRequest, NextResponse } from "next/server";

// Define the structure for a Gemini interview question
interface GeminiQuestion {
  id: string;
  question: string;
  type: "technical" | "behavioral" | "system-design";
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  hints?: string[];
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

    // Ensure techStack is an array
    const techStackArray = Array.isArray(techStack) 
      ? techStack 
      : typeof techStack === 'string' 
        ? techStack.split(',').map((item: string) => item.trim())
        : [];

    // Generate interview questions using Google Gemini
    const { text: generatedQuestions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Generate ${noOfQuestions} interview questions for a ${role} position with ${experience} experience level and ${difficultyLevel} difficulty.
      
      Focus: ${type} questions
      Tech Stack: ${techStackArray.join(", ")}
      
      Each question should include:
      1. A unique ID
      2. The question text
      3. Question type (technical, behavioral, or system-design)
      4. Difficulty level (Easy, Medium, Hard)
      5. Category (e.g., JavaScript, React, Algorithms, etc.)
      6. Optional hints (2-3 hints if appropriate)
      
      Return ONLY a valid JSON array of question objects with the following structure:
      [
        {
          "id": "1",
          "question": "Explain the concept of closures in JavaScript",
          "type": "technical",
          "difficulty": "Medium",
          "category": "JavaScript",
          "hints": ["Think about scope and variable access", "Consider how functions remember their lexical scope"]
        }
      ]
      
      IMPORTANT:
      - Return ONLY valid JSON, nothing else
      - Ensure all fields are populated appropriately
      - Make questions appropriate for the experience level and role
      - Do not include markdown or any other formatting
      - Make sure each question has a unique ID
      - For behavioral questions, focus on situational and experience-based questions
      - For system design questions, focus on architecture and scalability concepts
      `,
    });

    // Clean up the response and parse the generated questions
    let questions: GeminiQuestion[];
    try {
      // Remove any markdown formatting if present
      const cleanText = generatedQuestions.replace(/```json\s*|\s*```/g, '').trim();
      questions = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Error parsing generated questions:", parseError);
      console.error("Raw response:", generatedQuestions);
      throw new Error("Failed to parse generated questions");
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

    // In Firebase implementation, we would need to fetch the interview document
    // For now, we'll assume the interview data is available or passed in the request
    // This is a simplified approach - in a full implementation, we would fetch from Firestore

    // For this Firebase implementation, we'll assume interview data is passed in the request
    // In a full implementation, we would fetch this from Firestore
    const feedbackUserId = session.user.id;

    // Format the conversation for evaluation
    const conversation = responses.map((response: any) => 
      `Question: ${response.question}\nAnswer: ${response.answer}`
    ).join("\n\n");

    // Generate evaluation using Google Gemini
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
    let evaluation: InterviewEvaluation;
    try {
      // Remove any markdown formatting if present
      const cleanText = evaluationText.replace(/```json\s*|\s*```/g, '').trim();
      evaluation = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Error parsing evaluation:", parseError);
      console.error("Raw response:", evaluationText);
      throw new Error("Failed to parse evaluation");
    }

    // Save feedback to database
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
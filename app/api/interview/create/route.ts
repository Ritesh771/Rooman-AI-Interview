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
  } = await req.json();

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

    const interviewData = {
      name: name as string,
      role: role as string,
      type: type as string,
      techStack: (techStack as string).split(","),
      experience: experience as string,
      noOfQuestions: noOfQuestions,
      difficultyLevel: difficultyLevel as string,
      userId: userId as string,
      isCompleted: false,
      questions: JSON.parse(
        GeneratedQuestions.replace(/^```json\n|```$/g, "").trim()
      ) as string[],
    };

    await createInterview({
      ...interviewData,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}

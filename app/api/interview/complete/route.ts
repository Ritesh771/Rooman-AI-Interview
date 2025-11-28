import { auth } from "@/app/(auth-pages)/auth";
import { SavedMessage } from "@/app/components/interview/interview-body";
import { createInterviewFeedback, updateInterview } from "@/lib/firebase-data";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const conversation = (data.conservation as SavedMessage[])
    .map(
      (msg) =>
        `${msg.role.toLocaleLowerCase() === "user" ? "User" : "Assistant"}: ${
          msg.content
        }`
    )
    .join("\n");

  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `
              Evaluate the user’s performance in the interview.
              ${conversation}
              If the conversation is too short, lacks meaningful questions return exactly this:
              {}
              If the conversation is valid, return a single valid JSON object with the following structure:
              {
                  "feedbackObject": "A concise summary (350–400 characters) highlighting performance and areas of improvement.",
                  "ProblemSolving": <1–100>,
                  "SystemDesign": <1–100>,
                  "CommunicationSkills": <1–100>,
                  "TechnicalAccuracy": <1–100>,
                  "BehavioralResponses": <1–100>,
                  "TimeManagement": <1–100>
              }

              ❗ STRICT RULES:
              Don't start with json in the results
              Do NOT include any markdown, triple backticks, or code blocks
              Do NOT include any text, labels, commentary, or variable names before or after the JSON
              Do NOT escape characters (e.g., no \n or \")
              Do NOT wrap the output in quotes
              Return only the raw JSON object as shown above — nothing else
              If the interview is invalid, return exactly: {}
`,
    });
    const feedbackObject = JSON.parse(
      text.replace(/^```json\n|```$/g, "").trim()
    );
    if (feedbackObject && feedbackObject.feedbackObject.trim() != "") {
      const feedBackData = {
        interviewId: data.id,
        userId: data.userid,
        feedBack: feedbackObject.feedbackObject,
        problemSolving: feedbackObject.ProblemSolving,
        systemDesign: feedbackObject.SystemDesign,
        communicationSkills: feedbackObject.CommunicationSkills,
        technicalAccuracy: feedbackObject.TechnicalAccuracy,
        behavioralResponses: feedbackObject.BehavioralResponses,
        timeManagement: feedbackObject.TimeManagement,
      };

      await createInterviewFeedback(feedBackData);

      // Update the interview status to completed
      await updateInterview(data.id, { isCompleted: true });

      return Response.json({ status: 200 });
    }
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}

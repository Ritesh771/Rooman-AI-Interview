import { auth } from "@/app/(auth-pages)/auth";
import { createInterviewFeedback, updateInterview } from "@/lib/firebase-data";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interviewId, results } = await req.json();

    if (!interviewId || !results) {
      return NextResponse.json(
        { error: "Missing interviewId or results" },
        { status: 400 }
      );
    }

    // Create feedback record for coding interview
    const feedbackData = {
      interviewId: interviewId,
      userId: session.user.id, // This is uid, but should be doc id? Wait, for consistency, change to doc id.
      feedBack: `Coding interview completed with average score: ${results.averageScore}%. Status: ${results.passed ? 'Passed' : 'Failed'}`,
      problemSolving: results.averageScore, // Using average score as problem solving metric
      systemDesign: results.averageScore, // Using average score as system design metric
      communicationSkills: 0, // Not applicable for coding interviews
      technicalAccuracy: results.averageScore, // Using average score as technical accuracy
      behavioralResponses: 0, // Not applicable for coding interviews
      timeManagement: 0, // Not applicable for coding interviews
    };

    // Create the feedback record
    await createInterviewFeedback(feedbackData);

    // Update the interview status to completed
    await updateInterview(interviewId, { isCompleted: true });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error completing coding interview:", error);
    return NextResponse.json(
      { error: "Failed to complete coding interview" },
      { status: 500 }
    );
  }
}
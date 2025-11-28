import { prisma } from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { interviewId, results } = await req.json();

    if (!interviewId || !results) {
      return NextResponse.json(
        { error: "Missing interviewId or results" },
        { status: 400 }
      );
    }

    // First, get the interview to retrieve the userId
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      select: { userId: true }
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Create feedback record for coding interview
    const feedbackData = {
      interviewId: interviewId,
      userId: interview.userId,
      feedBack: `Coding interview completed with average score: ${results.averageScore}%. Status: ${results.passed ? 'Passed' : 'Failed'}`,
      problemSolving: results.averageScore, // Using average score as problem solving metric
      systemDesign: results.averageScore, // Using average score as system design metric
      communicationSkills: 0, // Not applicable for coding interviews
      technicalAccuracy: results.averageScore, // Using average score as technical accuracy
      behavioralResponses: 0, // Not applicable for coding interviews
      timeManagement: 0, // Not applicable for coding interviews
    };

    // Create the feedback record
    await prisma.interviewFeedback.create({
      data: feedbackData,
    });

    // Update interview status to completed
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        isCompleted: true,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error completing coding interview:", error);
    return NextResponse.json(
      { error: "Failed to complete coding interview" },
      { status: 500 }
    );
  }
}
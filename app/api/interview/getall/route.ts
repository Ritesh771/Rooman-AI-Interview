import { auth } from "@/app/(auth-pages)/auth";
import { prisma } from "@/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  try {
    const interviews = await prisma.interview.findMany({
      where: {
        userId,
      },
      include: {
        feedBack: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the expected format
    const transformedInterviews = interviews.map(interview => ({
      id: interview.id,
      name: interview.name,
      type: interview.type,
      role: interview.role,
      difficultyLevel: interview.difficultyLevel,
      isCompleted: interview.isCompleted,
      createdAt: interview.createdAt,
      feedBack: interview.feedBack?.feedBack || null,
      totalScore: interview.feedBack ? 
        Math.round((
          interview.feedBack.problemSolving +
          interview.feedBack.systemDesign +
          interview.feedBack.communicationSkills +
          interview.feedBack.technicalAccuracy +
          interview.feedBack.behavioralResponses +
          interview.feedBack.timeManagement
        ) / 6) : null
    }));

    return NextResponse.json(transformedInterviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}
import { auth } from "@/app/(auth-pages)/auth";
import { getInterviewsByUserId } from "@/lib/firebase-data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  try {
    const interviews = await getInterviewsByUserId(userId);

    // Transform the data to match the expected format
    const transformedInterviews = interviews.map((interview: any) => {
      // Convert createdAt to a proper Date object
      let createdAt: Date;
      if (interview.createdAt?.toDate) {
        // Firebase Timestamp
        createdAt = interview.createdAt.toDate();
      } else if (interview.createdAt instanceof Date) {
        createdAt = interview.createdAt;
      } else if (typeof interview.createdAt === 'string') {
        createdAt = new Date(interview.createdAt);
      } else if (interview.createdAt?.seconds) {
        // Timestamp-like object
        createdAt = new Date(interview.createdAt.seconds * 1000);
      } else {
        createdAt = new Date();
      }

      return {
        id: interview.id,
        name: interview.name,
        type: interview.type,
        role: interview.role,
        difficultyLevel: interview.difficultyLevel,
        isCompleted: interview.isCompleted,
        createdAt: createdAt.toISOString(), // Convert to ISO string for proper serialization
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
      };
    });

    return NextResponse.json(transformedInterviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}
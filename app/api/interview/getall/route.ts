import { auth } from "@/app/(auth-pages)/auth";
import { getInterviewsByUserId } from "@/lib/firebase-data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const companyFilter = searchParams.get('company');

  try {
    const interviews = await getInterviewsByUserId(userId);

    // Filter by company if specified
    let filteredInterviews = interviews;
    if (companyFilter) {
      filteredInterviews = interviews.filter((interview: any) => interview.company === companyFilter);
    }

    // Transform the data to match the expected format
    const transformedInterviews = filteredInterviews.map((interview: any) => {
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
          // For aptitude rounds, use problemSolving score directly
          // For coding interviews, use problemSolving score (pass/fail percentage)
          // For other rounds, use average of all metrics
          interview.type === 'gemini-aptitude' || interview.type?.startsWith('gemini-') ?
            interview.feedBack.problemSolving :
            // Check if it's a coding interview (problemSolving = systemDesign = technicalAccuracy)
            (interview.feedBack.problemSolving === interview.feedBack.systemDesign && 
             interview.feedBack.systemDesign === interview.feedBack.technicalAccuracy) ?
              interview.feedBack.problemSolving :
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
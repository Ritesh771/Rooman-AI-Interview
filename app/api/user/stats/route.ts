import { auth } from "@/app/(auth-pages)/auth";
import { getUserByIdBasic, getInterviewsByUserIdBasic, getAllUsersWithFeedback } from "@/lib/firebase-data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserByIdBasic(session.user.id);

    const interviews: any[] = await getInterviewsByUserIdBasic(session.user.id);

    const interviewStats = {
      total: interviews.length,
      completed: interviews.filter((i: any) => i.isCompleted).length,
      inProgress: interviews.filter((i: any) => !i.isCompleted).length,
    };

    // Get leaderboard data - top 10 users by average mock interview score
    const leaderboardUsers: any[] = await getAllUsersWithFeedback();

    // Calculate average scores for each user and sort by score
    const leaderboardWithScores: any[] = leaderboardUsers
      .map((user: any) => {
        if (user.feedBack.length === 0) return null;

        // Calculate average score across all feedback categories
        const totalScore = user.feedBack.reduce((sum: any, feedback: any) => {
          return sum + Math.round((
            feedback.problemSolving +
            feedback.systemDesign +
            feedback.communicationSkills +
            feedback.technicalAccuracy +
            feedback.behavioralResponses +
            feedback.timeManagement
          ) / 6);
        }, 0);

        const averageScore = Math.round(totalScore / user.feedBack.length);

        return {
          id: user.id,
          name: user.name,
          image: user.image,
          totalScore: averageScore
        };
      })
      .filter((user: any) => user !== null) // Remove null values
      .sort((a: any, b: any) => (b.totalScore - a.totalScore)) // Sort by score descending
      .slice(0, 10); // Take top 10

    return NextResponse.json({
      user,
      interviewStats,
      leaderboard: leaderboardWithScores
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 });
  }
}
import { getAllUsersWithFeedback } from "@/lib/firebase-data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get leaderboard data - top 10 users by average mock interview score
    const leaderboardUsers: any[] = await getAllUsersWithFeedback();

    // If no real data, return dummy data for testing
   

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

    return NextResponse.json({ leaderboard: leaderboardWithScores });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
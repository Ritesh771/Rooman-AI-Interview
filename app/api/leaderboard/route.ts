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

        // Calculate average score across all feedback categories, matching dashboard calculation
        const totalScore = user.feedBack.reduce((sum: number, feedback: any) => {
          const scores = [
            feedback.problemSolving || 0,
            feedback.systemDesign || 0,
            feedback.communicationSkills || 0,
            feedback.technicalAccuracy || 0,
            feedback.behavioralResponses || 0,
            feedback.timeManagement || 0
          ];
          const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          return sum + avgScore;
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
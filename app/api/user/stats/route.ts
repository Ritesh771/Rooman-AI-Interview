import { auth } from "@/app/(auth-pages)/auth";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    const interviews = await prisma.interview.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        isCompleted: true,
      },
    });

    const interviewStats = {
      total: interviews.length,
      completed: interviews.filter(i => i.isCompleted).length,
      inProgress: interviews.filter(i => !i.isCompleted).length,
    };

    // Get leaderboard data - top 10 users by average interview score
    const leaderboard = await prisma.user.findMany({
      where: {
        feedBack: {
          some: {} // Only users who have at least one feedback
        }
      },
      select: {
        id: true,
        name: true,
        image: true,
        feedBack: {
          select: {
            problemSolving: true,
            systemDesign: true,
            communicationSkills: true,
            technicalAccuracy: true,
            behavioralResponses: true,
            timeManagement: true,
          }
        }
      },
      // Order by number of feedback entries first, then take only what we need
      take: 20 // Fetch more than needed to ensure we have enough after filtering
    });

    // Calculate average scores for each user and sort by score
    const leaderboardWithScores = leaderboard
      .map(user => {
        if (user.feedBack.length === 0) return null;
        
        // Calculate average score across all feedback categories
        const totalScore = user.feedBack.reduce((sum, feedback) => {
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
      .filter((user): user is NonNullable<typeof user> => user !== null) // Remove null values with proper typing
      .sort((a, b) => (b.totalScore - a.totalScore)) // Sort by score descending
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
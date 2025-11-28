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

    return NextResponse.json({
      user,
      interviewStats
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 });
  }
}
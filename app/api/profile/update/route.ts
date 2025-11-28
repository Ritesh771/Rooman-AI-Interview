import { auth } from "@/app/(auth-pages)/auth";
import { updateUserProfile } from "@/lib/firebase-data";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    console.log("Session:", session);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { summary, workExperience, projects, skills, education, certifications } = await req.json();
    console.log("Data:", { summary, workExperience, projects, skills, education, certifications });

    await updateUserProfile(session.user.id, {
      summary,
      workExperience,
      projects,
      skills,
      education,
      certifications,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
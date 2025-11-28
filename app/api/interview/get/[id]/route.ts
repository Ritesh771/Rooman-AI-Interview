import { auth } from "@/app/(auth-pages)/auth";
import { getInterviewById } from "@/lib/firebase-data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const interviewID = (await params)?.id;
  if (!interviewID) {
    return NextResponse.json({ error: "Missing interviewID" }, { status: 400 });
  }
  try {
    const interviews = await getInterviewById(interviewID);
    return NextResponse.json(interviews);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { rawProfileText } = await req.json();

    if (!rawProfileText) {
      return NextResponse.json({ error: "Raw profile text is required" }, { status: 400 });
    }

    const { text: structuredProfile } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Parse the following raw profile text and extract structured information. Return ONLY a valid JSON object with these exact keys:

{
  "summary": "Professional summary text",
  "skills": "Skills organized by categories with proper formatting",
  "workExperience": "Work experience with company, dates, role, and bullet points",
  "projects": "Key projects with descriptions",
  "education": "Education with institution, degree, dates, and grades",
  "certifications": "Certifications with title and date"
}

Rules:
- Extract information accurately from the provided text
- Format work experience as: "Company (dates) - Role, Location\\n• Bullet point\\n• Bullet point"
- Format education as: "Degree - Institution, Location (dates) - Grade"
- Format certifications as: "Certification Title — Issuer (date)"
- Keep skills organized by categories like "Languages: skill1, skill2"
- Ensure all text is properly formatted and professional
- Return ONLY the JSON object, no additional text or markdown

Raw profile text:
${rawProfileText}`,
    });

    // Parse the AI response
    const parsedProfile = JSON.parse(structuredProfile.replace(/^```json\n|```$/g, "").trim());

    return NextResponse.json({ structuredProfile: parsedProfile });
  } catch (error) {
    console.error("Error structuring profile:", error);
    return NextResponse.json({ error: "Failed to structure profile" }, { status: 500 });
  }
}
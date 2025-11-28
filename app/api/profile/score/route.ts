import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { profileData } = await req.json();

    if (!profileData) {
      return NextResponse.json({ error: "Profile data is required" }, { status: 400 });
    }

    // Create a comprehensive profile text from the structured data
    let profileText = "";
    
    if (profileData.summary) {
      profileText += `Professional Summary:\n${profileData.summary}\n\n`;
    }
    
    if (profileData.workExperience) {
      profileText += `Work Experience:\n${profileData.workExperience}\n\n`;
    }
    
    if (profileData.projects) {
      profileText += `Projects:\n${profileData.projects}\n\n`;
    }
    
    if (profileData.skills) {
      profileText += `Skills:\n${profileData.skills}\n\n`;
    }
    
    if (profileData.education) {
      profileText += `Education:\n${profileData.education}\n\n`;
    }
    
    if (profileData.certifications) {
      profileText += `Certifications:\n${profileData.certifications}\n\n`;
    }

    const { text: scoreAnalysis } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Analyze the following professional profile and provide a comprehensive scoring assessment. 

Profile Content:
${profileText}

Please evaluate this profile and provide a detailed analysis with the following structure:
{
  "score": 85,
  "maxScore": 100,
  "analysis": "A detailed explanation of the score (300-400 words)",
  "strengths": ["List of key strengths identified in the profile"],
  "weaknesses": ["Areas that need improvement in the profile"],
  "recommendations": ["Specific recommendations to improve the profile"],
  "sections": {
    "summary": {
      "score": 20,
      "maxScore": 20,
      "feedback": "Feedback on the professional summary"
    },
    "experience": {
      "score": 25,
      "maxScore": 25,
      "feedback": "Feedback on work experience section"
    },
    "projects": {
      "score": 15,
      "maxScore": 15,
      "feedback": "Feedback on projects section"
    },
    "skills": {
      "score": 10,
      "maxScore": 10,
      "feedback": "Feedback on skills section"
    },
    "education": {
      "score": 10,
      "maxScore": 10,
      "feedback": "Feedback on education section"
    },
    "certifications": {
      "score": 5,
      "maxScore": 5,
      "feedback": "Feedback on certifications section"
    }
  }
}

IMPORTANT:
- Return ONLY valid JSON, nothing else
- Ensure all fields are populated
- Provide realistic scores based on the profile quality
- Do not include markdown or any other formatting
- Be constructive and specific in your feedback
- The total score should be out of 100
`,
    });

    // Clean up the response and parse the evaluation
    let scoreResult;
    try {
      // Remove any markdown formatting if present
      const cleanText = scoreAnalysis.replace(/```json\s*|\s*```/g, '').trim();
      scoreResult = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Error parsing score analysis:", parseError);
      console.error("Raw response:", scoreAnalysis);
      throw new Error("Failed to parse score analysis");
    }

    return NextResponse.json({ scoreResult }, { status: 200 });
  } catch (error) {
    console.error("Error scoring profile:", error);
    return NextResponse.json({ error: "Failed to score profile" }, { status: 500 });
  }
}
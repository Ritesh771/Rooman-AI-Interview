"use server";

import { z } from "zod";
import { FormState } from "../components/auth/auth-form";
import { auth } from "../(auth-pages)/auth";

const CreateInterviewSchema = z.object({
  name: z.string().trim().min(2),
  type: z.string().trim().min(2),
  role: z.string().trim().min(2),
  techStack: z.string().trim().min(2),
  experience: z.string().trim().min(2),
  difficultyLevel: z.string().trim().min(2),
  noOfQuestions: z.number().nonnegative(),
  userId: z.string().nonempty(),
});

export async function handleCreateInterviewFormAction(
  prevState: FormState,
  formData: FormData
) {
  try {
    const Session = await auth();
    const userId = Session?.user?.id;

    const data = {
      name: formData.get("name"),
      type: formData.get("type"),
      role: formData.get("role"),
      techStack: formData.get("techStack"),
      experience: formData.get("experience"),
      difficultyLevel: formData.get("difficultyLevel"),
      noOfQuestions: formData.get("numberOfQuestions")
        ? parseInt(formData.get("numberOfQuestions") as string)
        : null,
      userId: userId,
    };
    
    await CreateInterviewSchema.parseAsync(data);

    // Check if this is a coding interview
    const interviewType = formData.get("interviewType") || "Live Voice Interview";
    const isCodingInterview = interviewType === "Coding Round";
    const isGeminiInterview = interviewType === "Aptitude Round";
    
    console.log("Form data received:", {
      interviewType,
      type: formData.get("type"),
      isGeminiInterview
    });
    
    // For Gemini interviews (aptitude rounds), override the type to "aptitude"
    const interviewData = {
      ...data,
      type: isGeminiInterview ? "aptitude" : data.type,
    };
    
    console.log("Final interview data:", interviewData);
    
    // Determine which API endpoint to use
    let apiUrl;
    if (isCodingInterview) {
      apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/interview/create-coding`;
    } else if (isGeminiInterview) {
      apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/interview/gemini`;
    } else {
      apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/interview/create`;
    }

    const createInterviewRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(interviewData),
    });

    if (createInterviewRes.ok) {
      return { success: true };
    } else {
      const errorData = await createInterviewRes.json();
      console.error("API Error:", errorData);
      return { success: false };
    }
  } catch (e) {
    console.error("Form Action Error:", e);
    return { success: false };
  }
}

export async function handleCompleteInterviewAction(data:any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/interview/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      const result = await response.json();

      // Check if this is part of a company interview sequence
      const nextInterview = await getNextCompanyInterview(data.id, data.userid);

      return { success: true, nextInterview };
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error("Interview completion API Error:", errorData);
      return { success: false, error: errorData.error || `HTTP ${response.status}: ${response.statusText}` };
    }
  } catch (e) {
    console.error("Interview completion error:", e);
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function handleCreateCompanyInterviewAction(
  prevState: FormState,
  formData: FormData
) {
  try {
    const Session = await auth();
    const userId = Session?.user?.id;

    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    const company = formData.get("company") as string;
    const role = formData.get("role") as string;
    const techStack = formData.get("techStack") as string;
    const difficultyLevel = formData.get("difficultyLevel") as string;
    const experience = formData.get("experience") as string;
    const noOfQuestions = parseInt(formData.get("noOfQuestions") as string);

    // Create 3 separate interviews for the company
    const interviewTypes = [
      { type: 'aptitude', name: `${company} Aptitude Test`, apiEndpoint: 'gemini' },
      { type: 'coding', name: `${company} Coding Challenge`, apiEndpoint: 'create-coding' },
      { type: 'voice', name: `${company} Live Interview`, apiEndpoint: 'create' }
    ];

    const interviewIds: { [key: string]: string } = {};

    for (const interviewType of interviewTypes) {
      const interviewData = {
        name: interviewType.name,
        type: interviewType.type,
        role,
        techStack,
        difficultyLevel,
        experience,
        noOfQuestions,
        userId,
        company,
      };

      const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/interview/${interviewType.apiEndpoint}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interviewData),
      });

      if (response.ok) {
        const result = await response.json();
        interviewIds[interviewType.type] = result.id || result.interview?.id;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        return { success: false, error: `Failed to create ${interviewType.type} interview: ${errorData.error || `HTTP ${response.status}`}` };
      }
    }

    return { success: true, interviewIds };
  } catch (e) {
    console.error("Company interview creation error:", e);
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

async function getNextCompanyInterview(currentInterviewId: string, userId: string) {
  try {
    // Get the current interview details
    const currentResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/interview/get/${currentInterviewId}`);
    if (!currentResponse.ok) return null;

    const currentInterview = await currentResponse.json();
    if (!currentInterview.company) return null; // Not a company interview

    // Get all interviews for this user and company
    const allResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/interview/getall?userId=${userId}&company=${currentInterview.company}`);
    if (!allResponse.ok) return null;

    const allInterviews = await allResponse.json();

    // Define the sequence: aptitude -> coding -> voice
    const sequence = ['gemini-aptitude', 'coding', 'voice'];
    const currentTypeIndex = sequence.indexOf(currentInterview.type);

    if (currentTypeIndex === -1 || currentTypeIndex === sequence.length - 1) {
      return null; // Not in sequence or last interview
    }

    const nextType = sequence[currentTypeIndex + 1];

    // Find the next interview in the sequence
    const nextInterview = allInterviews.find((interview: any) =>
      interview.type === nextType &&
      interview.company === currentInterview.company &&
      !interview.isCompleted
    );

    return nextInterview ? { id: nextInterview.id, type: nextType } : null;
  } catch (error) {
    console.error('Error getting next company interview:', error);
    return null;
  }
}
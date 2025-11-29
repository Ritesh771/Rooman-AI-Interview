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
    const interviewType = formData.get("interviewType") || "Regular";
    const isCodingInterview = interviewType === "Coding";
    const isGeminiInterview = interviewType === "Gemini";
    
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
      body: JSON.stringify(data),
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
      return { success: true };
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
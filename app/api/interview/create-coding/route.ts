import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { createInterview } from "@/lib/firebase-data";

// Define the structure for a coding challenge
interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleTestCases: { input: string; output: string }[];
  hiddenTestCases: { input: string; output: string }[];
}

// Define the structure for a coding interview
interface CodingInterview {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  experienceLevel: string;
  numberOfQuestions: number;
  role: string;
  challenges: CodingChallenge[];
}

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      type,
      role,
      techStack,
      experience,
      difficultyLevel,
      noOfQuestions,
      userId,
    } = await req.json();

    // Generate coding challenges using Google Gemini
    const { text: generatedChallenges } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Generate ${noOfQuestions} coding interview challenges for a ${role} position with ${experience} experience level and ${difficultyLevel} difficulty.
      
      Each challenge should include:
      1. A unique title
      2. A clear problem description
      3. Input format specification
      4. Output format specification
      5. Constraints
      6. 2 sample test cases with input/output
      7. 3 hidden test cases with input/output for evaluation
      
      Return ONLY a valid JSON array of challenge objects with the following structure:
      [
        {
          "id": "1",
          "title": "Two Sum",
          "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
          "difficulty": "Easy",
          "inputFormat": "First line contains an integer n representing the size of array. Second line contains n space separated integers representing the array elements. Third line contains an integer target.",
          "outputFormat": "Print two space separated integers representing the indices of the two numbers that add up to target.",
          "constraints": "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9",
          "sampleTestCases": [
            {
              "input": "4\\n2 7 11 15\\n9",
              "output": "0 1"
            },
            {
              "input": "3\\n3 2 4\\n6",
              "output": "1 2"
            }
          ],
          "hiddenTestCases": [
            {
              "input": "2\\n3 3\\n6",
              "output": "0 1"
            },
            {
              "input": "5\\n1 2 3 4 5\\n8",
              "output": "2 4"
            },
            {
              "input": "6\\n-1 -2 -3 -4 -5 -6\\n-7",
              "output": "0 5"
            }
          ]
        }
      ]
      
      IMPORTANT:
      - Return ONLY valid JSON, nothing else
      - Ensure all fields are populated
      - Make problems appropriate for the experience level and role
      - Ensure hidden test cases are more comprehensive than sample test cases
      - Do not include markdown or any other formatting
      - Make sure each challenge has a unique ID
      `,
    });

    // Clean up the response and parse the generated challenges
    let challenges: CodingChallenge[];
    try {
      // Remove any markdown formatting if present
      const cleanText = generatedChallenges.replace(/```json\s*|\s*```/g, '').trim();
      challenges = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Error parsing generated challenges:", parseError);
      console.error("Raw response:", generatedChallenges);
      throw new Error("Failed to parse generated challenges");
    }

    // Create the coding interview object
    const codingInterview: CodingInterview = {
      title: name as string,
      difficulty: difficultyLevel as "Easy" | "Medium" | "Hard",
      experienceLevel: experience as string,
      numberOfQuestions: noOfQuestions,
      role: role as string,
      challenges
    };

    // Save to database
    const createdInterview = await createInterview({
      name: name as string,
      role: role as string,
      type: type as string,
      techStack: (techStack as string).split(","),
      experience: experience as string,
      difficultyLevel: difficultyLevel as string,
      noOfQuestions: noOfQuestions,
      userId: userId as string,
      isCompleted: false,
      // Store the coding interview data as JSON
      questions: codingInterview as any,
    });

    return NextResponse.json({ success: true, interview: createdInterview }, { status: 200 });
  } catch (error) {
    console.error("Error creating coding interview:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
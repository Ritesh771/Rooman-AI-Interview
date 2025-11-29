import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

interface CodeEvaluation {
  score: number; // 0-100
  feedback: string;
  correctness: number; // 0-100
  efficiency: number; // 0-100
  readability: number; // 0-100
  explanation: string;
}

export async function POST(req: NextRequest) {
  let testCasePassed = false; // Default value

  try {
    const {
      code,
      language,
      problemTitle,
      problemDescription,
      testCasePassed: passed,
      testInput,
      testOutput,
      expectedOutput,
      actualOutput
    } = await req.json();

    testCasePassed = passed; // Update with actual value

    // Generate AI evaluation using Google Gemini
    const { text: evaluationText } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Evaluate the following code submission for a coding problem:

PROBLEM TITLE: ${problemTitle}

PROBLEM DESCRIPTION: ${problemDescription}

CODE SUBMITTED (${language}):
${code}

TEST CASE EVALUATION:
- Input: ${testInput}
- Expected Output: ${expectedOutput}
- Actual Output: ${actualOutput}
- Test Case Passed: ${testCasePassed ? 'YES' : 'NO'}

Please provide a comprehensive evaluation with the following structure:
{
  "score": 85,
  "feedback": "Brief feedback on the solution (2-3 sentences)",
  "correctness": 90,
  "efficiency": 75,
  "readability": 80,
  "explanation": "Detailed explanation of the scoring (100-150 words)"
}

SCORING CRITERIA:
- correctness: How well the code solves the problem (0-100)
- efficiency: Time/space complexity and optimization (0-100)
- readability: Code clarity, naming, structure (0-100)
- overall score: Weighted average considering all factors

IMPORTANT:
- Return ONLY valid JSON, nothing else
- Be fair but constructive
- Consider edge cases and robustness
- Do not include markdown or any other formatting
- Provide realistic scores based on code quality
`,
    });

    // Clean up the response and parse the evaluation
    let evaluation: CodeEvaluation;
    try {
      // Remove any markdown formatting if present
      const cleanText = evaluationText.replace(/```json\s*|\s*```/g, '').trim();
      evaluation = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Error parsing code evaluation:", parseError);
      console.error("Raw response:", evaluationText);
      throw new Error("Failed to parse code evaluation");
    }

    return NextResponse.json({ success: true, evaluation }, { status: 200 });
  } catch (error: any) {
    console.error("Error evaluating code:", error);

    // Check if it's a quota exceeded error
    if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      console.warn('AI quota exceeded, this is expected behavior');
    }

    // Return a fallback evaluation instead of throwing error
    const fallbackEvaluation: CodeEvaluation = {
      score: testCasePassed ? 80 : 40,
      feedback: testCasePassed
        ? "Code passes the test case. AI evaluation unavailable due to quota limits."
        : "Code fails the test case. AI evaluation unavailable due to quota limits.",
      correctness: testCasePassed ? 85 : 35,
      efficiency: 70,
      readability: 65,
      explanation: "AI evaluation service is currently unavailable due to quota limits. Scoring is based on test case results only."
    };

    return NextResponse.json({ success: true, evaluation: fallbackEvaluation }, { status: 200 });
  }
}
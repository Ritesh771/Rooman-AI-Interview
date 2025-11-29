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

// Fallback coding challenges when API quota is exceeded
function generateFallbackCodingChallenges(count: number, difficulty: string): CodingChallenge[] {
  const challenges: CodingChallenge[] = [];

  // Easy challenges
  const easyChallenges: CodingChallenge[] = [
    {
      id: "1",
      title: "Two Sum",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
      difficulty: "Easy",
      inputFormat: "First line contains an integer n representing the size of array. Second line contains n space separated integers representing the array elements. Third line contains an integer target.",
      outputFormat: "Print two space separated integers representing the indices of the two numbers that add up to target.",
      constraints: "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9",
      sampleTestCases: [
        { input: "4\n2 7 11 15\n9", output: "0 1" },
        { input: "3\n3 2 4\n6", output: "1 2" }
      ],
      hiddenTestCases: [
        { input: "2\n3 3\n6", output: "0 1" },
        { input: "5\n1 2 3 4 5\n8", output: "2 4" },
        { input: "6\n-1 -2 -3 -4 -5 -6\n-7", output: "0 5" }
      ]
    },
    {
      id: "2",
      title: "Palindrome Number",
      description: "Given an integer x, return true if x is a palindrome, and false otherwise. An integer is a palindrome when it reads the same backward as forward.",
      difficulty: "Easy",
      inputFormat: "First line contains an integer x.",
      outputFormat: "Print 'true' if the number is palindrome, 'false' otherwise.",
      constraints: "-2^31 <= x <= 2^31 - 1",
      sampleTestCases: [
        { input: "121", output: "true" },
        { input: "-121", output: "false" }
      ],
      hiddenTestCases: [
        { input: "10", output: "false" },
        { input: "0", output: "true" },
        { input: "12321", output: "true" }
      ]
    },
    {
      id: "3",
      title: "Valid Parentheses",
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
      difficulty: "Easy",
      inputFormat: "First line contains a string s.",
      outputFormat: "Print 'true' if the string is valid, 'false' otherwise.",
      constraints: "1 <= s.length <= 10^4, s consists of parentheses only '()[]{}'",
      sampleTestCases: [
        { input: "()[]{}", output: "true" },
        { input: "(]", output: "false" }
      ],
      hiddenTestCases: [
        { input: "([)]", output: "false" },
        { input: "{[]}", output: "true" },
        { input: "", output: "true" }
      ]
    }
  ];

  // Medium challenges
  const mediumChallenges: CodingChallenge[] = [
    {
      id: "4",
      title: "Longest Substring Without Repeating Characters",
      description: "Given a string s, find the length of the longest substring without repeating characters.",
      difficulty: "Medium",
      inputFormat: "First line contains a string s.",
      outputFormat: "Print an integer representing the length of the longest substring without repeating characters.",
      constraints: "0 <= s.length <= 5 * 10^4, s consists of English letters, digits, symbols and spaces.",
      sampleTestCases: [
        { input: "abcabcbb", output: "3" },
        { input: "bbbbb", output: "1" }
      ],
      hiddenTestCases: [
        { input: "pwwkew", output: "3" },
        { input: "", output: "0" },
        { input: "dvdf", output: "3" }
      ]
    },
    {
      id: "5",
      title: "Container With Most Water",
      description: "Given n non-negative integers a1, a2, ..., an, where each represents a point at coordinate (i, ai). n vertical lines are drawn such that the two endpoints of the line i is at (i, ai) and (i, 0). Find two lines, which, together with the x-axis forms a container, such that the container contains the most water.",
      difficulty: "Medium",
      inputFormat: "First line contains an integer n. Second line contains n space separated integers representing the heights.",
      outputFormat: "Print an integer representing the maximum area of water the container can store.",
      constraints: "2 <= n <= 10^5, 0 <= height[i] <= 10^4",
      sampleTestCases: [
        { input: "9\n1 8 6 2 5 4 8 3 7", output: "49" },
        { input: "2\n1 1", output: "1" }
      ],
      hiddenTestCases: [
        { input: "5\n1 2 1 3 1", output: "4" },
        { input: "4\n2 3 4 5", output: "6" },
        { input: "3\n1 2 3", output: "2" }
      ]
    }
  ];

  // Hard challenges
  const hardChallenges: CodingChallenge[] = [
    {
      id: "6",
      title: "Median of Two Sorted Arrays",
      description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
      difficulty: "Hard",
      inputFormat: "First line contains two integers m and n. Second line contains m space separated integers for nums1. Third line contains n space separated integers for nums2.",
      outputFormat: "Print the median as a floating point number with 5 decimal places.",
      constraints: "nums1.length == m, nums2.length == n, 0 <= m <= 1000, 0 <= n <= 1000, 1 <= m + n <= 2000, -10^6 <= nums1[i], nums2[i] <= 10^6",
      sampleTestCases: [
        { input: "2 1\n1 3\n2", output: "2.00000" },
        { input: "2 2\n1 2\n3 4", output: "2.50000" }
      ],
      hiddenTestCases: [
        { input: "1 1\n1\n1", output: "1.00000" },
        { input: "0 1\n\n1", output: "1.00000" },
        { input: "2 2\n1 3\n2 4", output: "2.50000" }
      ]
    }
  ];

  // Select challenges based on difficulty and count
  let availableChallenges: CodingChallenge[] = [];
  
  if (difficulty === "Easy") {
    availableChallenges = easyChallenges;
  } else if (difficulty === "Medium") {
    availableChallenges = [...easyChallenges, ...mediumChallenges];
  } else {
    availableChallenges = [...easyChallenges, ...mediumChallenges, ...hardChallenges];
  }

  // Shuffle and select the required number of challenges
  const shuffled = availableChallenges.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // Reassign IDs to ensure uniqueness
  selected.forEach((challenge, index) => {
    challenge.id = (index + 1).toString();
  });

  return selected;
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
      company,
    } = await req.json();

    // Generate coding challenges using Google Gemini
    let challenges: CodingChallenge[];
    
    try {
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
      try {
        // Remove any markdown formatting if present
        const cleanText = generatedChallenges.replace(/```json\s*|\s*```/g, '').trim();
        challenges = JSON.parse(cleanText);
      } catch (parseError) {
        console.error("Error parsing generated challenges:", parseError);
        console.error("Raw response:", generatedChallenges);
        // Use fallback if parsing fails
        challenges = generateFallbackCodingChallenges(noOfQuestions, difficultyLevel);
      }
    } catch (apiError: any) {
      console.error("Gemini API quota exceeded for coding interview, using fallback challenges:", apiError.message);
      
      // Generate fallback coding challenges
      challenges = generateFallbackCodingChallenges(noOfQuestions, difficultyLevel);
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
      company: company as string,
      // Store the coding interview data as JSON
      questions: codingInterview as any,
    });

    return NextResponse.json({ success: true, interview: createdInterview }, { status: 200 });
  } catch (error) {
    console.error("Error creating coding interview:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}    // Create the coding interview object
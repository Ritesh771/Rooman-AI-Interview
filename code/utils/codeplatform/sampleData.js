// Sample coding interview data for testing

export const sampleCodingInterview = {
  title: "Frontend Developer Coding Interview - Medium",
  difficulty: "Medium",
  experienceLevel: "2-5 years",
  numberOfQuestions: 3,
  role: "Frontend Developer",
  challenges: [
    {
      id: "1",
      title: "Array Sum Target",
      description: "Given an array of integers and a target value, find two distinct indices such that the corresponding elements sum to the target.",
      difficulty: "Easy",
      inputFormat: "First line contains an integer n representing array size. Second line contains n space-separated integers. Third line contains the target integer.",
      outputFormat: "Print two space-separated integers representing the indices (0-based).",
      constraints: "2 ≤ n ≤ 10^4, -10^9 ≤ nums[i] ≤ 10^9, -10^9 ≤ target ≤ 10^9",
      sampleTestCases: [
        {
          input: "4\n2 7 11 15\n9",
          output: "0 1"
        },
        {
          input: "3\n3 2 4\n6",
          output: "1 2"
        }
      ],
      hiddenTestCases: [
        {
          input: "2\n3 3\n6",
          output: "0 1"
        },
        {
          input: "5\n1 2 3 4 5\n8",
          output: "2 4"
        },
        {
          input: "6\n-1 -2 -3 -4 -5 -6\n-7",
          output: "0 5"
        }
      ]
    },
    {
      id: "2",
      title: "Valid Parentheses",
      description: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      difficulty: "Medium",
      inputFormat: "Single line containing a string of parentheses.",
      outputFormat: "Print 'true' if valid, 'false' otherwise.",
      constraints: "1 ≤ s.length ≤ 10^4, s consists of parentheses only.",
      sampleTestCases: [
        {
          input: "()",
          output: "true"
        },
        {
          input: "()[]{}",
          output: "true"
        }
      ],
      hiddenTestCases: [
        {
          input: "(]",
          output: "false"
        },
        {
          input: "([)]",
          output: "false"
        },
        {
          input: "{[]}",
          output: "true"
        }
      ]
    },
    {
      id: "3",
      title: "Longest Substring Without Repeating Characters",
      description: "Given a string, find the length of the longest substring without repeating characters.",
      difficulty: "Medium",
      inputFormat: "Single line containing a string.",
      outputFormat: "Print a single integer representing the length of longest substring.",
      constraints: "0 ≤ s.length ≤ 5 * 10^4, s consists of English letters, digits, symbols and spaces.",
      sampleTestCases: [
        {
          input: "abcabcbb",
          output: "3"
        },
        {
          input: "bbbbb",
          output: "1"
        }
      ],
      hiddenTestCases: [
        {
          input: "pwwkew",
          output: "3"
        },
        {
          input: "",
          output: "0"
        },
        {
          input: "abcdef",
          output: "6"
        }
      ]
    }
  ]
};
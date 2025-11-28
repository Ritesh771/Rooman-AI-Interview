"use client";

import { useState, useEffect } from "react";
import CodingInterview from "@/code/components/codeplatform/CodingInterview";
import { useRouter } from "next/navigation";

interface TestCase {
  input: string;
  output: string;
}

interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleTestCases: TestCase[];
  hiddenTestCases: TestCase[];
}

interface CodingInterviewData {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  experienceLevel: string;
  numberOfQuestions: number;
  role: string;
  challenges: CodingChallenge[];
}

interface InterviewResults {
  scores: number[];
  averageScore: number;
  passed: boolean;
  totalScore: number;
}

export default function CodingInterviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [interviewData, setInterviewData] = useState<CodingInterviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/interview/get/${params.id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch interview data");
        }
        
        // Extract the coding interview data from the questions field
        if (data.questions && typeof data.questions === 'object' && data.questions.challenges) {
          setInterviewData(data.questions);
        } else {
          throw new Error("Invalid coding interview data structure");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewData();
  }, [params.id]);

  const handleInterviewComplete = async (results: InterviewResults) => {
    try {
      // Save the results to the database
      const response = await fetch(`/api/interview/complete-coding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewId: params.id,
          results: results,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save interview results");
      }

      // Show completion message and redirect to dashboard
      alert(`Interview completed!\nAverage Score: ${results.averageScore}%\nStatus: ${results.passed ? 'Passed' : 'Failed'}`);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving interview results:", error);
      alert("Failed to save interview results. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div>Loading interview...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <div style={{ color: "red", padding: "1rem", border: "1px solid red", borderRadius: "4px" }}>
          <strong>Error!</strong> {error}
        </div>
        <button 
          onClick={() => router.push("/dashboard")}
          style={{ marginTop: "1rem", padding: "0.5rem 1rem", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "4px" }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div style={{ padding: "2rem" }}>
        <div style={{ color: "orange", padding: "1rem", border: "1px solid orange", borderRadius: "4px" }}>
          <strong>No Data!</strong> No interview data found.
        </div>
        <button 
          onClick={() => router.push("/dashboard")}
          style={{ marginTop: "1rem", padding: "0.5rem 1rem", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "4px" }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <CodingInterview 
        interviewData={interviewData} 
        onComplete={handleInterviewComplete}
      />
    </div>
  );
}
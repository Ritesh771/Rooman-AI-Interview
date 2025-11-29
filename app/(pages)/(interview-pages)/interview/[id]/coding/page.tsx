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

export default function CodingInterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [interviewData, setInterviewData] = useState<CodingInterviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewId, setInterviewId] = useState<string>("");
  const [completionResults, setCompletionResults] = useState<InterviewResults | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setInterviewId(id);
        const response = await fetch(`/api/interview/get/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch interview data");
        }
        
        // Extract the coding interview data from the questions field
        if (data.questions && typeof data.questions === 'object' && data.questions.challenges) {
          setInterviewData({ ...data.questions, company: data.company });
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
  }, [interviewId]);

  const checkNextCompanyInterview = async (currentId: string, company: string) => {
    try {
      // First get the current interview to determine its type
      const currentResponse = await fetch(`/api/interview/get/${currentId}`);
      if (!currentResponse.ok) return { nextInterview: null };

      const currentInterview = await currentResponse.json();
      if (!currentInterview.company || currentInterview.company !== company) {
        return { nextInterview: null };
      }

      // Get all interviews for this company
      const response = await fetch(`/api/interview/getall?company=${encodeURIComponent(company)}`);
      if (!response.ok) return { nextInterview: null };

      const interviews = await response.json();
      const sequence = ['gemini-aptitude', 'coding', 'voice'];
      const currentTypeIndex = sequence.indexOf(currentInterview.type);

      if (currentTypeIndex === -1 || currentTypeIndex === sequence.length - 1) {
        return { nextInterview: null };
      }

      const nextType = sequence[currentTypeIndex + 1];
      const nextInterview = interviews.find((interview: any) =>
        interview.type === nextType && !interview.isCompleted
      );

      return { nextInterview: nextInterview || null };
    } catch (error) {
      console.error('Error checking next interview:', error);
      return { nextInterview: null };
    }
  };

  const handleInterviewComplete = async (results: InterviewResults) => {
    try {
      // Save the results to the database
      const response = await fetch(`/api/interview/complete-coding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewId: interviewId,
          results: results,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save interview results");
      }

      // Check if this is part of a company interview sequence
      const nextInterviewResponse = await fetch(`/api/interview/get/${interviewId}`);
      if (nextInterviewResponse.ok) {
        const interviewData = await nextInterviewResponse.json();
        if (interviewData.company) {
          // Check for next interview in sequence
          const sequenceCheck = await checkNextCompanyInterview(interviewId, interviewData.company);
          if (sequenceCheck.nextInterview) {
            // Redirect to next interview
            window.location.href = `/interview/${sequenceCheck.nextInterview.id}`;
            return;
          }
        }
      }

      // Show completion screen with results
      setCompletionResults(results);
      setShowCompletion(true);
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

  if (showCompletion && completionResults) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        backgroundColor: "#f5f5f5", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "2rem"
      }}>
        <div style={{ 
          backgroundColor: "white", 
          borderRadius: "12px", 
          padding: "3rem", 
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          maxWidth: "500px",
          width: "100%",
          textAlign: "center"
        }}>
          <div style={{ 
            fontSize: "4rem", 
            marginBottom: "1rem" 
          }}>
            {completionResults.passed ? "🎉" : "📚"}
          </div>
          
          <h1 style={{ 
            fontSize: "2rem", 
            fontWeight: "bold", 
            color: "#1f2937",
            marginBottom: "1rem" 
          }}>
            Interview Completed!
          </h1>
          
          <div style={{ 
            fontSize: "1.5rem", 
            fontWeight: "600",
            color: completionResults.passed ? "#10b981" : "#f59e0b",
            marginBottom: "1rem"
          }}>
            Average Score: {completionResults.averageScore}%
          </div>
          
          <div style={{ 
            fontSize: "1.2rem", 
            color: completionResults.passed ? "#10b981" : "#f59e0b",
            marginBottom: "2rem",
            fontWeight: "500"
          }}>
            Status: {completionResults.passed ? "PASSED" : "FAILED"}
          </div>
          
          <div style={{ 
            backgroundColor: "#f3f4f6", 
            padding: "1.5rem", 
            borderRadius: "8px",
            marginBottom: "2rem"
          }}>
            <h3 style={{ 
              fontSize: "1.1rem", 
              fontWeight: "600", 
              color: "#374151",
              marginBottom: "1rem" 
            }}>
              Question Scores:
            </h3>
            <div style={{ 
              display: "flex", 
              flexWrap: "wrap", 
              gap: "0.5rem",
              justifyContent: "center"
            }}>
              {completionResults.scores.map((score, index) => (
                <div key={index} style={{ 
                  backgroundColor: score >= 70 ? "#d1fae5" : "#fef3c7",
                  color: score >= 70 ? "#065f46" : "#92400e",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  fontWeight: "500"
                }}>
                  Q{index + 1}: {score}%
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => router.push("/dashboard")}
            style={{ 
              backgroundColor: "#3b82f6", 
              color: "white", 
              padding: "0.75rem 2rem", 
              borderRadius: "8px",
              border: "none",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "background-color 0.2s"
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = "#2563eb"}
            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = "#3b82f6"}
          >
            Return to Dashboard
          </button>
        </div>
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
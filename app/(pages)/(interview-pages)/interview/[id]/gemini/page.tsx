"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Badge } from "@/app/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface GeminiQuestion {
  id: string;
  question: string;
  type: "technical" | "behavioral" | "system-design" | "aptitude";
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  hints?: string[];
  options?: string[]; // For multiple choice questions
  correctAnswer?: string; // For multiple choice questions
}

interface InterviewResponse {
  questionId: string;
  question: string;
  answer: string;
}

interface InterviewEvaluation {
  feedback: string;
  score: number;
  strengths: string[];
  improvements: string[];
  technicalSkills: number;
  communication: number;
  problemSolving: number;
  systemDesign: number;
}

export default function GeminiInterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [interviewData, setInterviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [showHints, setShowHints] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0); // Will be set based on number of questions
  const [interviewId, setInterviewId] = useState<string>("");

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
        
        // Extract the Gemini interview data from the questions field
        let interview;
        if (data.questions && typeof data.questions === 'object' && data.questions.questions) {
          interview = data.questions;
        } else {
          // Handle case where questions might be directly in the data object
          interview = data;
        }
        
        setInterviewData({ ...interview, company: data.company });
        
        // Set timer based on number of questions (2 minutes per question)
        const noOfQuestions = interview.noOfQuestions || 5;
        const totalTime = noOfQuestions * 2 * 60; // 2 minutes per question in seconds
        setTimeRemaining(totalTime);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewData();
  }, [interviewId]);

  // Timer effect
  useEffect(() => {
    if (!interviewData || evaluation) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewData, evaluation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (interviewData.questions?.length || 0) - 1) {
      // Save current response
      const answer = currentQuestion.type === "aptitude" ? selectedOption : currentAnswer;
      const newResponse: InterviewResponse = {
        questionId: interviewData.questions[currentQuestionIndex].id,
        question: interviewData.questions[currentQuestionIndex].question,
        answer: answer,
      };
      
      setResponses([...responses, newResponse]);
      setCurrentAnswer("");
      setSelectedOption("");
      setShowHints(false);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Save current response if not already saved
      let updatedResponses = [...responses];
      const existingResponseIndex = updatedResponses.findIndex(
        r => r.questionId === interviewData.questions[currentQuestionIndex].id
      );
      
      const answer = currentQuestion.type === "aptitude" ? selectedOption : currentAnswer;
      
      if (existingResponseIndex !== -1) {
        updatedResponses[existingResponseIndex].answer = answer;
      } else {
        const newResponse: InterviewResponse = {
          questionId: interviewData.questions[currentQuestionIndex].id,
          question: interviewData.questions[currentQuestionIndex].question,
          answer: answer,
        };
        updatedResponses.push(newResponse);
      }
      
      setResponses(updatedResponses);
      const previousQuestion = interviewData.questions[currentQuestionIndex - 1];
      const previousResponse = updatedResponses.find(r => 
        r.questionId === previousQuestion.id
      );
      
      if (previousQuestion.type === "aptitude" && previousQuestion.options) {
        setSelectedOption(previousResponse?.answer || "");
        setCurrentAnswer("");
      } else {
        setCurrentAnswer(previousResponse?.answer || "");
        setSelectedOption("");
      }
      
      setShowHints(false);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitInterview = async () => {
    // Save current response
    const updatedResponses = [...responses];
    const answer = currentQuestion.type === "aptitude" ? selectedOption : currentAnswer;
    const newResponse: InterviewResponse = {
      questionId: interviewData.questions[currentQuestionIndex].id,
      question: interviewData.questions[currentQuestionIndex].question,
      answer: answer,
    };
    updatedResponses.push(newResponse);
    setResponses(updatedResponses);

    setIsSubmitting(true);
    
    try {
      // Submit responses for evaluation
      const response = await fetch(`/api/interview/gemini`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewId: interviewId,
          responses: updatedResponses,
          userId: interviewData.userId || interviewData.user?.id,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to evaluate interview");
      }
      
      setEvaluation(result.evaluation);

      // Check if this is part of a company interview sequence
      if (interviewData.company) {
        const sequenceCheck = await checkNextCompanyInterview(interviewId, interviewData.company);
        if (sequenceCheck.nextInterview) {
          // Redirect to next interview
          router.push(`/interview/${sequenceCheck.nextInterview.id}`);
          return;
        }
      }
    } catch (error: any) {
      console.error("Error submitting interview:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center">
              <AlertCircle className="mr-2" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Button 
              onClick={() => router.push("/dashboard")}
              className="mt-4"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-orange-500">No Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No interview data found.</p>
            <Button 
              onClick={() => router.push("/dashboard")}
              className="mt-4"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (evaluation) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Interview Evaluation</span>
              <Badge variant="secondary" className="text-lg">
                Score: {evaluation.score}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Technical Skills</p>
                <p className="text-xl font-bold">{evaluation.technicalSkills}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Communication</p>
                <p className="text-xl font-bold">{evaluation.communication}</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Problem Solving</p>
                <p className="text-xl font-bold">{evaluation.problemSolving}</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">System Design</p>
                <p className="text-xl font-bold">{evaluation.systemDesign}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Feedback</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{evaluation.feedback}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Strengths</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {evaluation.strengths.map((strength, index) => (
                    <li key={index} className="text-green-700">{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Areas for Improvement</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {evaluation.improvements.map((improvement, index) => (
                    <li key={index} className="text-orange-700">{improvement}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={handleFinish} className="w-full md:w-auto">
                <CheckCircle className="mr-2" />
                Finish Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ensure we have questions data
  const questions = interviewData.questions || [];
  if (questions.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-orange-500">No Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No questions found for this interview.</p>
            <Button 
              onClick={() => router.push("/dashboard")}
              className="mt-4"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Timer and Progress */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center mb-2 md:mb-0">
          <div className="text-2xl font-mono bg-gray-800 text-white px-3 py-1 rounded">
            {formatTime(timeRemaining)}
          </div>
          <div className="ml-4">
            <span className="text-sm text-gray-600">Question</span>
            <div className="font-semibold">
              {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-wrap justify-between items-start gap-2">
            <CardTitle className="flex-1">
              {currentQuestion.question}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{currentQuestion.type}</Badge>
              <Badge variant="outline">{currentQuestion.difficulty}</Badge>
              <Badge variant="outline">{currentQuestion.category}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentQuestion.hints && currentQuestion.hints.length > 0 && (
            <div className="mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowHints(!showHints)}
                className="mb-2"
              >
                {showHints ? "Hide Hints" : "Show Hints"}
              </Button>
              {showHints && (
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  {currentQuestion.hints.map((hint: string, index: number) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          <div className="mt-4">
            {currentQuestion.type === "aptitude" && currentQuestion.options ? (
              <div>
                <label className="block text-sm font-medium mb-3">
                  Choose the correct answer:
                </label>
                <div className="space-y-2">
                  {currentQuestion.options?.map((option: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="radio"
                        id={`option-${index}`}
                        name="answer"
                        value={option}
                        checked={selectedOption === option}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="mr-3"
                      />
                      <label 
                        htmlFor={`option-${index}`}
                        className="cursor-pointer text-sm"
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="answer" className="block text-sm font-medium mb-2">
                  Your Answer
                </label>
                <Textarea
                  id="answer"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={8}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <Button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            Previous
          </Button>
        </div>
        <div className="flex gap-3">
          {currentQuestionIndex < questions.length - 1 ? (
            <Button 
              onClick={handleNextQuestion}
              disabled={
                currentQuestion.type === "aptitude" 
                  ? !selectedOption 
                  : !currentAnswer.trim()
              }
            >
              Next Question
            </Button>
          ) : (
            <Button 
              onClick={handleSubmitInterview} 
              disabled={
                isSubmitting || 
                (currentQuestion.type === "aptitude" 
                  ? !selectedOption 
                  : !currentAnswer.trim())
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Interview"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
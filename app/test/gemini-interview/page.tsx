"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Textarea } from "@/app/components/ui/textarea";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

export default function TestGeminiInterview() {
  const [interviewData, setInterviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTestInterview = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/interview/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Frontend Developer Test",
          type: "Technical",
          role: "Frontend Developer",
          techStack: "React, JavaScript, CSS", // String format to test the fix
          experience: "3-5 years",
          difficultyLevel: "Medium",
          noOfQuestions: 5,
          userId: "clx6qfxj20000iwkza1hxz6b5", // Using a valid test user ID
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create interview");
      }
      
      setInterviewData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Gemini Interview Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This page tests the Gemini-powered interview functionality. Click the button below to create a test interview.
          </p>
          <p className="mb-4 text-sm text-gray-600">
            Note: This test uses a predefined user ID. In a real application, the user ID would be obtained from the authenticated session.
          </p>
          
          <Button 
            onClick={createTestInterview} 
            disabled={isLoading}
            className="mb-4"
          >
            {isLoading ? "Creating Interview..." : "Create Test Interview"}
          </Button>
          
          {error && (
            <div className="text-red-500 p-3 bg-red-50 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {interviewData && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Interview Created Successfully</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(interviewData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
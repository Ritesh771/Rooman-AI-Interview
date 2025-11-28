import { useState } from "react";
import CodingInterview from "./CodingInterview";
import { sampleCodingInterview } from "@/code/utils/codeplatform/sampleData";
import { Button } from "@/components/ui/button";

const TestCodingInterview = () => {
  const [showInterview, setShowInterview] = useState(false);
  
  const handleInterviewComplete = (results) => {
    console.log("Interview completed with results:", results);
    alert(`Interview completed!\nAverage Score: ${results.averageScore}%\nStatus: ${results.passed ? 'Passed' : 'Failed'}`);
    setShowInterview(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!showInterview ? (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6">Coding Interview Demo</h1>
            <p className="text-lg text-gray-700 mb-8">
              This is a demo of the improved coding interview interface with a LeetCode-like design.
              Click the button below to start a sample coding interview.
            </p>
            <Button 
              onClick={() => setShowInterview(true)}
              className="px-6 py-3 text-lg"
            >
              Start Sample Interview
            </Button>
          </div>
        </div>
      ) : (
        <CodingInterview 
          interviewData={sampleCodingInterview} 
          onComplete={handleInterviewComplete}
        />
      )}
    </div>
  );
};

export default TestCodingInterview;
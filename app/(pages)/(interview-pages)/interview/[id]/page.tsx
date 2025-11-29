import InterviewCall from '@/app/components/interview/interview-call';
import InterviewContent from '@/app/components/interview/interview-content';
import InterviewOverlay from '@/app/components/interview/interview-overlay';
import CodingInterviewPage from './coding/page';
import GeminiInterviewPage from './gemini/page';
import React from 'react'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const interviewId = (await params).id;
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/interview/get/${interviewId}`)
  const data = await response.json();
  
  // Add the interview id to the data
  const interviewData = { ...data, id: interviewId };
  
  // Check if this is a coding interview by checking if it has challenges
  if (interviewData && interviewData.questions && typeof interviewData.questions === 'object' && !Array.isArray(interviewData.questions) && interviewData.questions.challenges) {
    return (
      <div>
        <CodingInterviewPage params={Promise.resolve({ id: interviewId })} />
      </div>
    );
  }
  
  // Check if this is a Gemini/aptitude interview by checking the type
  if (interviewData && interviewData.type && (interviewData.type.startsWith('gemini-') || interviewData.type === 'aptitude')) {
    return (
      <div>
        <GeminiInterviewPage params={Promise.resolve({ id: interviewId })} />
      </div>
    );
  }
  
  return (
    <InterviewContent {...interviewData} />
  );
};

export default Page
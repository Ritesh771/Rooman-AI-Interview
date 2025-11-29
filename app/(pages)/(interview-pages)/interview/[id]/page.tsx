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
  
  // Check if this is a coding interview by checking if it has challenges
  if (data && data.questions && typeof data.questions === 'object' && !Array.isArray(data.questions) && data.questions.challenges) {
    return (
      <div>
        <CodingInterviewPage params={Promise.resolve({ id: interviewId })} />
      </div>
    );
  }
  
  // Check if this is a Gemini interview by checking the type
  if (data && data.type && data.type.startsWith('gemini-')) {
    return (
      <div>
        <GeminiInterviewPage params={Promise.resolve({ id: interviewId })} />
      </div>
    );
  }
  
  return (
    <InterviewContent {...data} />
  );
};

export default Page
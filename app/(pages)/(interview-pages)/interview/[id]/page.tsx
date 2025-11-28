import InterviewCall from '@/app/components/interview/interview-call';
import InterviewContent from '@/app/components/interview/interview-content';
import InterviewOverlay from '@/app/components/interview/interview-overlay';
import CodingInterviewPage from './coding/page';
import React from 'react'

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const interviewId = (await params).id;
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/interview/get/${interviewId}`)
  const data = await response.json();
  
  // Check if this is a coding interview by checking if it has challenges
  // This is a simple check - in a real implementation, you might have a specific flag
  if (data && data.questions && typeof data.questions === 'object' && !Array.isArray(data.questions) && data.questions.challenges) {
    // For now, we'll redirect to the coding interview page
    // In a real implementation, you might want to pass the data directly
    return (
      <div>
        {/*
          We're using a client component approach here.
          The coding interview page will fetch its own data.
        */}
        <CodingInterviewPage params={{ id: interviewId }} />
      </div>
    );
  }
  
  return (
    <InterviewContent {...data} />
  );
};

export default Page
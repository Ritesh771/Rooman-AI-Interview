import React, { Suspense } from 'react'
import { InterviewProgressChart } from '../interview-progress-chart'
import DashboardTabHeader from '../dashboard-tab-header'
import { SkillsPerformanceChart } from '../skill-performance-chart'
import LeaderBoard from '../leader-board'
import { getUserWithInterviewsAndFeedback } from '@/lib/firebase-data'
import { auth } from '@/app/(auth-pages)/auth'
import Loader from '../../ui/loader'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

// AI-generated content functions
async function generateMotivationalQuote() {
  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Generate a short, inspiring motivational quote about perseverance, success, or personal growth. 
      Return ONLY the quote text and author, separated by a dash. 
      Format: "Quote text" - Author Name
      Keep it under 150 characters total.
      Make it relevant for someone preparing for job interviews or career development.`
    });
    return text.trim();
  } catch (error) {
    // Fallback quotes
    const fallbackQuotes = [
      '"Success is not final, failure is not fatal: It is the courage to continue that counts." - Winston Churchill',
      '"The only way to do great work is to love what you do." - Steve Jobs',
      '"Believe you can and you\'re halfway there." - Theodore Roosevelt',
      '"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt'
    ];
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  }
}

async function generateSkillTips(weakSkills: string[]) {
  if (weakSkills.length === 0) return null;
  
  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Generate 2-3 specific, actionable tips for improving these interview skills: ${weakSkills.join(', ')}.
      
      CRITICAL: Return ONLY a valid JSON array of strings. No markdown, no code blocks, no extra text.
      Each tip should be concise (under 100 characters) and focus on practical advice for job interviews.
      
      Example output: ["Practice explaining your thought process out loud", "Use the STAR method for behavioral questions"]
      
      Do not include any text before or after the JSON array.`
    });
    
    // Clean the response - remove any markdown code blocks or extra text
    let cleanText = text.trim();
    
    // Remove markdown code blocks if present
    if (cleanText.includes('```json')) {
      cleanText = cleanText.split('```json')[1]?.split('```')[0]?.trim() || cleanText;
    } else if (cleanText.includes('```')) {
      cleanText = cleanText.split('```')[1]?.split('```')[0]?.trim() || cleanText;
    }
    
    // Try to find JSON array in the text
    const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
    }
    
    try {
      const parsed = JSON.parse(cleanText);
      if (Array.isArray(parsed)) {
        return parsed.filter(tip => typeof tip === 'string' && tip.trim().length > 0).slice(0, 3);
      }
    } catch {
      // If parsing fails, try to extract individual tips
      const lines = cleanText.split('\n').map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('💡') && !line.startsWith('-') && !line.startsWith('•'))
        .filter(line => line.length < 150) // Reasonable tip length
        .slice(0, 3);
      
      return lines.length > 0 ? lines : null;
    }
  } catch (error) {
    // Fallback tips based on skills
    const fallbackTips: { [key: string]: string[] } = {
      'Problem Solving': ['Break down complex problems into smaller steps', 'Practice algorithmic thinking daily'],
      'System Design': ['Study common design patterns and architectures', 'Practice explaining system trade-offs'],
      'Communication Skills': ['Practice speaking clearly and confidently', 'Record yourself answering questions'],
      'Technical Accuracy': ['Review fundamental concepts regularly', 'Explain concepts in simple terms'],
      'Behavioral Responses': ['Use the STAR method for all responses', 'Prepare stories from your experience'],
      'Time Management': ['Practice under time constraints', 'Prioritize key points in responses']
    };
    
    const tips: string[] = [];
    weakSkills.forEach(skill => {
      const skillTips = fallbackTips[skill] || ['Focus on consistent practice'];
      tips.push(...skillTips.slice(0, 1)); // Take 1 tip per skill
    });
    
    return tips.slice(0, 3);
  }
}

const DashboardTab = async () => {
  const user = await auth();
  let Data: any = null;
  if (user != null && user.user?.id) {
    Data = await getUserWithInterviewsAndFeedback(user.user.id);
  }

  const totalInterViews: number = Data?.interviews?.length ?? 0;
  const completedInterViews: number = Data?.interviews?.filter((x: any) => x.isCompleted == true).length ?? 0;
  const inProgressInterViews: number = Data?.interviews?.filter((x: any) => x.isCompleted != true).length ?? 0;
  
  // Calculate completion percentage based on average feedback score
  const completionPercentage: number = Data?.feedBack && Data.feedBack.length > 0
    ? Math.round(
        Data.feedBack.reduce((sum: number, feedback: any) => {
          const scores = [
            feedback.problemSolving || 0,
            feedback.systemDesign || 0,
            feedback.communicationSkills || 0,
            feedback.technicalAccuracy || 0,
            feedback.behavioralResponses || 0,
            feedback.timeManagement || 0
          ];
          const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          return sum + avgScore;
        }, 0) / Data.feedBack.length
      )
    : 0;

  const chartData = [
    { type: "Problem Solving", value: Data?.feedBack?.reduce((a: any, b: any) => a + b.problemSolving, 0) },
    { type: "System Design", value: Data?.feedBack?.reduce((a: any, b: any) => a + b.systemDesign, 0) },
    { type: "Communication Skills", value: Data?.feedBack?.reduce((a: any, b: any) => a + b.communicationSkills, 0) },
    { type: "Technical Accuracy", value: Data?.feedBack?.reduce((a: any, b: any) => a + b.technicalAccuracy, 0) },
    { type: "Behavioral Responses", value: Data?.feedBack?.reduce((a: any, b: any) => a + b.behavioralResponses, 0) },
    { type: "Time Management", value: Data?.feedBack?.reduce((a: any, b: any) => a + b.timeManagement, 0) },
  ]

  // Get weakest skills for development suggestions
  const getWeakestSkills = () => {
    if (!chartData || chartData.length === 0) return [];
    
    return chartData
      .filter(skill => skill.value < 50) // Skills with score below 50
      .sort((a, b) => a.value - b.value) // Sort by lowest score first
      .slice(0, 3) // Top 3 weakest skills
      .map(skill => skill.type);
  };

  const weakestSkills = getWeakestSkills();

  // Generate AI content
  const [motivationalQuote, skillTips] = await Promise.all([
    generateMotivationalQuote(),
    generateSkillTips(weakestSkills)
  ]);

  return (
    <Suspense fallback={<Loader />}>
      <div className='w-full flex flex-col gap-5 pb-10 xl:pb-0 overflow-auto md:overflow-y-none'>
        <div>
          <DashboardTabHeader 
            completedInterViews={completedInterViews} 
            totalInterViews={inProgressInterViews} 
            userName={user?.user?.name ?? ''}
            completionPercentage={completionPercentage}
          />
        </div>

        <div className='flex flex-col xl:flex-row gap-y-5 gap-x-1.5'>
          <InterviewProgressChart 
            completedInterviews={completedInterViews}
            inProgressInterviews={inProgressInterViews} 
          />
          <SkillsPerformanceChart ChartData={chartData} />
          <LeaderBoard />
        </div>

        {/* Motivational Quote Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Keep Pushing Forward!</h3>
            <p className="text-sm text-gray-600 italic">
              {motivationalQuote}
            </p>
          </div>
        </div>

        {/* Skills Development Section */}
        {weakestSkills.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800">Today's Skills to Develop</h3>
            </div>
            <div className="space-y-2">
              {weakestSkills.map((skill, index) => (
                <div key={skill} className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-semibold text-green-700">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{skill}</span>
                  <div className="ml-auto text-xs text-gray-500">Focus Area</div>
                </div>
              ))}
            </div>
            {skillTips && skillTips.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Quick Tips:</h4>
                <ul className="space-y-1">
                  {skillTips.map((tip: string, index: number) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4 text-xs text-gray-600">
              <span>Practice these skills in your next interview to improve your overall performance!</span>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  )
}

export default DashboardTab
"use client";

import React, { useState, useEffect } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Textarea } from '../../ui/textarea'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { RadialBar, RadialBarChart } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../../ui/chart"
import { SignOutButton } from '../../auth/sign-out'

interface ProfileData {
  summary?: string
  workExperience?: string
  projects?: string
  skills?: string
  education?: string
  certifications?: string
}

// Add interface for score data
interface ScoreData {
  score: number;
  maxScore: number;
  analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  sections: {
    summary: { score: number; maxScore: number; feedback: string };
    experience: { score: number; maxScore: number; feedback: string };
    projects: { score: number; maxScore: number; feedback: string };
    skills: { score: number; maxScore: number; feedback: string };
    education: { score: number; maxScore: number; feedback: string };
    certifications: { score: number; maxScore: number; feedback: string };
  };
}

const chartConfig = {
  completion: {
    label: "Profile Completion"
  },
  remaining: {
    label: "Remaining"
  }
} satisfies ChartConfig

const CompleteProfileTab = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [rawProfileText, setRawProfileText] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [interviewStats, setInterviewStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0
  })
  const [formData, setFormData] = useState<ProfileData>({
    summary: '',
    workExperience: '',
    projects: '',
    skills: '',
    education: '',
    certifications: ''
  })
  // Add state for score data
  const [scoreData, setScoreData] = useState<ScoreData | null>(null)
  const [isScoring, setIsScoring] = useState(false)

  const handleAIParsing = async () => {
    if (!rawProfileText.trim()) {
      toast.error('Please enter profile text to parse')
      return
    }

    setIsParsing(true)
    try {
      const response = await fetch('/api/profile/structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rawProfileText })
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(data.structuredProfile)
        toast.success('Profile structured successfully!')
      } else {
        toast.error('Failed to structure profile')
      }
    } catch (error) {
      console.error('Error parsing profile:', error)
      toast.error('Error parsing profile')
    } finally {
      setIsParsing(false)
    }
  }

  useEffect(() => {
    loadProfile()
    loadUserData()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile/get')
      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          setFormData(data.profile)
        }
        if (data.user) {
          setUserData(data.user)
        }
        if (data.interviewStats) {
          setInterviewStats(data.interviewStats)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/user/stats')
      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
        setInterviewStats(data.interviewStats)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting form data:", formData)
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      console.log("Response:", response)
      if (response.ok) {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
        loadProfile() // Reload to show updated data
      } else {
        const error = await response.json()
        console.log("Error:", error)
        toast.error('Failed to update profile')
      }
    } catch (error) {
      console.log("Fetch error:", error)
      toast.error('Error updating profile')
    }
  }

  if (loading) {
    return <div>Loading profile...</div>
  }

  const hasData = Object.values(formData).some(value => value && value.trim() !== '')

  // Calculate profile completion percentage
  const filledFields = Object.values(formData).filter(value => value && value.trim() !== '').length
  const totalFields = 6
  const progressPercentage = Math.round((filledFields / totalFields) * 100)

  // Add function to calculate resume score
  const calculateResumeScore = async () => {
    if (!hasData) {
      toast.error('Please complete your profile first')
      return
    }

    setIsScoring(true)
    try {
      const response = await fetch('/api/profile/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profileData: formData })
      })

      if (response.ok) {
        const data = await response.json()
        setScoreData(data.scoreResult)
        toast.success('Resume scored successfully!')
      } else {
        toast.error('Failed to score resume')
      }
    } catch (error) {
      console.error('Error scoring resume:', error)
      toast.error('Error scoring resume')
    } finally {
      setIsScoring(false)
    }
  }

  if (!isEditing && hasData) {
    // View mode - Show only the score card as requested
    return (
      <div className='w-full flex flex-col gap-6 pb-10 xl:pb-0 overflow-auto md:overflow-y-none'>
        <div className='flex justify-between items-center'>
          <div>
            <h2 className='text-3xl font-bold text-gray-900'>Your Profile Score</h2>
            <p className='text-gray-600 mt-1'>AI-powered analysis of your resume</p>
          </div>
          <div className='flex items-center gap-2'>
            <SignOutButton />
            <Button onClick={() => setIsEditing(true)} className='bg-blue-600 hover:bg-blue-700'>
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile Completion Progress and Resume Score Card */}
        <div className='flex flex-wrap gap-6'>
          {/* Profile Completion Progress */}
          <Card className='shadow-sm flex z-10 flex-col gap-0 w-[240px] h-[240px] bg-white/60 rounded-4xl'>
            <CardHeader className="items-center pb-1">
              <CardTitle className="text-base">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-2 flex-1">
                <ChartContainer
                  config={chartConfig}
                  className="flex-1 aspect-square max-h-[80px]"
                >
                  <RadialBarChart
                    data={[
                      { type: "completion", visitors: progressPercentage, fill: "hsl(var(--chart-1))" },
                      { type: "remaining", visitors: 100 - progressPercentage, fill: "hsl(var(--chart-2))" },
                    ]}
                    innerRadius={20}
                    outerRadius={40}
                  >
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel nameKey="type" />}
                    />
                    <RadialBar dataKey="visitors" background={false} />
                  </RadialBarChart>
                </ChartContainer>
                <div className="flex-1 text-center">
                  <span className='text-xl font-bold text-gray-900'>{progressPercentage}%</span>
                  <p className='text-xs text-gray-600'>Complete</p>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-1 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Interviews:</span>
                  <span className="font-medium text-gray-900">{interviewStats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium text-green-600">{interviewStats.completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">In Progress:</span>
                  <span className="font-medium text-blue-600">{interviewStats.inProgress}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resume Score Card */}
          {scoreData ? (
            <Card className='shadow-sm flex z-10 flex-col gap-0 w-[240px] h-[240px] bg-white/60 rounded-4xl'>
              <CardHeader className="items-center pb-1">
                <CardTitle className="text-base">Resume Score</CardTitle>
              </CardHeader>
              <CardContent className="p-2 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-2 flex-1">
                  <ChartContainer
                    config={chartConfig}
                    className="flex-1 aspect-square max-h-[80px]"
                  >
                    <RadialBarChart
                      data={[
                        { type: "score", visitors: scoreData.score, fill: "hsl(var(--chart-1))" },
                        { type: "remaining", visitors: scoreData.maxScore - scoreData.score, fill: "hsl(var(--chart-2))" },
                      ]}
                      innerRadius={20}
                      outerRadius={40}
                    >
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel nameKey="type" />}
                      />
                      <RadialBar dataKey="visitors" background={false} />
                    </RadialBarChart>
                  </ChartContainer>
                  <div className="flex-1 text-center">
                    <span className='text-xl font-bold text-gray-900'>{scoreData.score}/{scoreData.maxScore}</span>
                    <p className='text-xs text-gray-600'>Score</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Strengths:</span>
                    <span className="font-medium text-green-600">{scoreData.strengths.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Areas to Improve:</span>
                    <span className="font-medium text-yellow-600">{scoreData.weaknesses.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Recommendations:</span>
                    <span className="font-medium text-blue-600">{scoreData.recommendations.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className='shadow-sm flex z-10 flex-col gap-0 w-[240px] h-[240px] bg-white/60 rounded-4xl'>
              <CardHeader className="items-center pb-1">
                <CardTitle className="text-base">Resume Score</CardTitle>
              </CardHeader>
              <CardContent className="p-2 flex-1 flex flex-col items-center justify-center">
                <p className="text-sm text-gray-600 mb-4 text-center">Get your resume scored by AI</p>
                <Button 
                  onClick={calculateResumeScore} 
                  disabled={isScoring}
                  className='bg-purple-600 hover:bg-purple-700'
                >
                  {isScoring ? 'Scoring...' : 'Score Resume'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Score Details Modal */}
        {scoreData && (
          <Card className='shadow-sm'>
            <CardHeader>
              <div className='flex justify-between items-center'>
                <CardTitle className='text-xl'>Resume Analysis</CardTitle>
                <Button 
                  variant='outline' 
                  onClick={() => setScoreData(null)}
                >
                  Close Analysis
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='mb-6'>
                <h3 className='text-lg font-semibold mb-2'>Overall Score: {scoreData.score}/{scoreData.maxScore}</h3>
                <p className='text-gray-700'>{scoreData.analysis}</p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <h4 className='font-semibold mb-2 text-green-700'>Strengths</h4>
                  <ul className='list-disc pl-5 space-y-1'>
                    {scoreData.strengths.map((strength, index) => (
                      <li key={index} className='text-gray-700'>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className='font-semibold mb-2 text-yellow-700'>Areas for Improvement</h4>
                  <ul className='list-disc pl-5 space-y-1'>
                    {scoreData.weaknesses.map((weakness, index) => (
                      <li key={index} className='text-gray-700'>{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className='mt-6'>
                <h4 className='font-semibold mb-2 text-blue-700'>Recommendations</h4>
                <ul className='list-disc pl-5 space-y-1'>
                  {scoreData.recommendations.map((recommendation, index) => (
                    <li key={index} className='text-gray-700'>{recommendation}</li>
                  ))}
                </ul>
              </div>

              <div className='mt-6'>
                <h4 className='font-semibold mb-3'>Section Scores</h4>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                  {Object.entries(scoreData.sections).map(([section, data]) => (
                    <Card key={section} className='p-3'>
                      <div className='flex justify-between items-center'>
                        <span className='font-medium capitalize'>{section}</span>
                        <span className='text-sm'>{data.score}/{data.maxScore}</span>
                      </div>
                      <p className='text-xs text-gray-600 mt-1'>{data.feedback}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Edit mode or no data
  return (
    <div className='w-full flex flex-col gap-5 pb-10 xl:pb-0 overflow-auto md:overflow-y-none'>
      <div className='flex justify-between items-center'>
        <div>
          <div className='text-2xl font-semibold'>
            {hasData ? 'Edit Your Profile' : 'Complete Your Profile'}
          </div>
          <div className='text-lg'>Add your details to personalize your interview experience.</div>
        </div>
        <SignOutButton />
      </div>

      {/* Profile Completion Progress */}
      <Card className='shadow-sm flex z-10 flex-col gap-0 w-[240px] h-[240px] bg-white/60 rounded-4xl'>
        <CardHeader className="items-center pb-1">
          <CardTitle className="text-base">Profile Completion</CardTitle>
        </CardHeader>
        <CardContent className="p-2 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-2 flex-1">
            <ChartContainer
              config={chartConfig}
              className="flex-1 aspect-square max-h-[80px]"
            >
              <RadialBarChart
                data={[
                  { type: "completion", visitors: progressPercentage, fill: "hsl(var(--chart-1))" },
                  { type: "remaining", visitors: 100 - progressPercentage, fill: "hsl(var(--chart-2))" },
                ]}
                innerRadius={20}
                outerRadius={40}
              >
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="type" />}
                />
                <RadialBar dataKey="visitors" background={false} />
              </RadialBarChart>
            </ChartContainer>
            <div className="flex-1 text-center">
              <span className='text-xl font-bold text-gray-900'>{progressPercentage}%</span>
              <p className='text-xs text-gray-600'>Complete</p>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-1 text-xs flex-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Interviews:</span>
              <span className="font-medium text-gray-900">{interviewStats.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-medium text-green-600">{interviewStats.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">In Progress:</span>
              <span className="font-medium text-blue-600">{interviewStats.inProgress}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* AI Parsing Section */}
      <Card className='border-dashed border-2 border-blue-300 bg-blue-50'>
        <CardHeader>
          <CardTitle className='text-blue-900'>AI-Powered Profile Parsing</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label htmlFor='rawProfile'>Paste your raw profile/resume text here</Label>
            <Textarea
              id='rawProfile'
              value={rawProfileText}
              onChange={(e) => setRawProfileText(e.target.value)}
              placeholder='Paste your complete profile or resume text here. The AI will automatically extract and structure your information...'
              rows={8}
              className='mt-2'
            />
          </div>
          <Button 
            onClick={handleAIParsing} 
            disabled={isParsing || !rawProfileText.trim()}
            className='bg-blue-600 hover:bg-blue-700'
          >
            {isParsing ? 'Parsing...' : 'Parse with AI ✨'}
          </Button>
        </CardContent>
      </Card>
      
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 max-w-2xl'>
        <div>
          <Label htmlFor='summary'>Professional Summary</Label>
          <Textarea
            id='summary'
            name='summary'
            value={formData.summary || ''}
            onChange={handleChange}
            placeholder='Brief summary about yourself...'
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor='workExperience'>Work Experience</Label>
          <Textarea
            id='workExperience'
            name='workExperience'
            value={formData.workExperience || ''}
            onChange={handleChange}
            placeholder='List your work experience...'
            rows={4}
          />
        </div>
        
        <div>
          <Label htmlFor='projects'>Projects</Label>
          <Textarea
            id='projects'
            name='projects'
            value={formData.projects || ''}
            onChange={handleChange}
            placeholder='Describe your key projects...'
            rows={4}
          />
        </div>
        
        <div>
          <Label htmlFor='skills'>Skills</Label>
          <Textarea
            id='skills'
            name='skills'
            value={formData.skills || ''}
            onChange={handleChange}
            placeholder='List your technical and soft skills...'
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor='education'>Education</Label>
          <Textarea
            id='education'
            name='education'
            value={formData.education || ''}
            onChange={handleChange}
            placeholder='Your educational background...'
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor='certifications'>Certifications</Label>
          <Textarea
            id='certifications'
            name='certifications'
            value={formData.certifications || ''}
            onChange={handleChange}
            placeholder='List your certifications...'
            rows={3}
          />
        </div>
        
        <div className='flex gap-2'>
          <Button type='submit'>Save Profile</Button>
          {hasData && (
            <Button type='button' variant='outline' onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default CompleteProfileTab
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

  if (!isEditing && hasData) {
    // View mode
    return (
      <div className='w-full flex flex-col gap-6 pb-10 xl:pb-0 overflow-auto md:overflow-y-none'>
        <div className='flex justify-between items-center'>
          <div>
            <h2 className='text-3xl font-bold text-gray-900'>Your Profile</h2>
            <p className='text-gray-600 mt-1'>Your professional information and achievements</p>
          </div>
          <div className='flex items-center gap-2'>
            <SignOutButton />
            <Button onClick={() => setIsEditing(true)} className='bg-blue-600 hover:bg-blue-700'>
              Edit Profile
            </Button>
          </div>
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
              {userData && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900 truncate ml-1">{userData.name || 'N/A'}</span>
                </div>
              )}
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

        <div className='space-y-6'>
          {/* Professional Summary */}
          {formData.summary && (
            <Card className='border-l-4 border-l-blue-500 shadow-sm'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-xl text-blue-900 flex items-center gap-2'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>{formData.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {formData.skills && (
            <Card className='border-l-4 border-l-green-500 shadow-sm'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-xl text-green-900 flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  Skills & Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {formData.skills.split(',').map((skill, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200 hover:bg-green-200 transition-colors'
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Experience */}
          {formData.workExperience && (
            <Card className='border-l-4 border-l-purple-500 shadow-sm'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-xl text-purple-900 flex items-center gap-2'>
                  <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg'>
                  {formData.workExperience}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {formData.projects && (
            <Card className='border-l-4 border-l-orange-500 shadow-sm'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-xl text-orange-900 flex items-center gap-2'>
                  <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
                  Key Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg'>
                  {formData.projects}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education Timeline */}
          {formData.education && (
            <Card className='border-l-4 border-l-indigo-500 shadow-sm'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-xl text-indigo-900 flex items-center gap-2'>
                  <div className='w-2 h-2 bg-indigo-500 rounded-full'></div>
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {formData.education.split('\n').filter(line => line.trim()).map((education, index) => (
                    <div key={index} className='flex items-start gap-4'>
                      <div className='flex flex-col items-center'>
                        <div className='w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-sm'></div>
                        {index < formData.education!.split('\n').filter(line => line.trim()).length - 1 && (
                          <div className='w-0.5 h-12 bg-indigo-200 mt-2'></div>
                        )}
                      </div>
                      <div className='flex-1 pb-4'>
                        <div className='bg-indigo-50 p-3 rounded-lg border border-indigo-100'>
                          <p className='text-gray-800 font-medium'>{education.trim()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {formData.certifications && (
            <Card className='border-l-4 border-l-red-500 shadow-sm'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-xl text-red-900 flex items-center gap-2'>
                  <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg'>
                  {formData.certifications}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
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
            {userData && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900 truncate ml-1">{userData.name || 'N/A'}</span>
              </div>
            )}
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
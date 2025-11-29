"use client";

import React, { useActionState, useState, startTransition } from 'react'
import { MockInterviewTable } from '../mock-interview-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { handleCreateCompanyInterviewAction } from '@/app/lib/form-actions'
import { Input } from '../../ui/input';
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { FetchMockInterviews } from '@/hooks/react-query/functions';
import { QueryKeys } from '@/hooks/react-query/keys';

const companies = [
  {
    name: 'Google',
    role: 'Software Engineer',
    description: 'Focuses on general tech aptitude and coding skills.',
    logo: 'https://logo.clearbit.com/google.com',
    type: 'Technical',
    techStack: 'JavaScript, Python, Algorithms',
    difficultyLevel: 'Medium',
    experience: '1-3 years',
    noOfQuestions: 10,
  },
  {
    name: 'Spotify',
    role: 'Data Analyst',
    description: 'Emphasizes data-related questions and coding.',
    logo: 'https://logo.clearbit.com/spotify.com',
    type: 'Technical',
    techStack: 'Python, SQL, Data Analysis',
    difficultyLevel: 'Medium',
    experience: '1-3 years',
    noOfQuestions: 10,
  },
  {
    name: 'Accenture',
    role: 'AI Engineer',
    description: 'Targets AI/machine learning aptitude and advanced coding.',
    logo: 'https://logo.clearbit.com/accenture.com',
    type: 'Technical',
    techStack: 'Python, Machine Learning, AI',
    difficultyLevel: 'Hard',
    experience: '3-5 years',
    noOfQuestions: 10,
  },
];

const MockInterviewTab = () => {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");
  const [state, formAction] = useActionState(handleCreateCompanyInterviewAction, { success: false });

  const queryResult = useQuery({
    queryKey: [QueryKeys.fetch_interview],
    queryFn: FetchMockInterviews,
    staleTime: Infinity,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  React.useEffect(() => {
    if (state.success && state.interviewIds) {
      // Redirect to the first interview (aptitude)
      router.push(`/interview/${state.interviewIds.aptitude}`);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const handleCompanySelect = (company: typeof companies[0]) => {
    const formData = new FormData();
    formData.append('company', company.name);
    formData.append('role', company.role);
    formData.append('techStack', company.techStack);
    formData.append('difficultyLevel', company.difficultyLevel);
    formData.append('experience', company.experience);
    formData.append('noOfQuestions', company.noOfQuestions.toString());

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card className="flex border-none h-full gap-0 bg-[#c1cbef] z-10 pt-0 px-0 rounded-4xl pb-0 w-full">
      <CardHeader className="flex py-4 justify-center flex-row">
        <h2 className="text-2xl font-bold">Select a Company Interview</h2>
      </CardHeader>
      <CardContent className="w-full py-8 px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
          {companies.map((company) => (
            <Card key={company.name} className="cursor-pointer hover:shadow-lg transition-shadow bg-white" onClick={() => handleCompanySelect(company)}>
              <CardHeader className="text-center">
                <Image src={company.logo} alt={company.name} width={80} height={80} className="mx-auto mb-4 rounded-lg" />
                <CardTitle className="text-lg">{company.name}</CardTitle>
                <CardDescription className="font-medium text-blue-600">{company.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 text-center">{company.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border-t pt-8">
          <h3 className="text-xl font-semibold mb-4 text-center">Your Previous Interviews</h3>
          <div className="flex justify-end mb-4">
            <Input
              className="p-5 bg-white rounded-full text-sm max-w-sm active:outline-none active:ring-0 focus:outline-none focus:ring-0 focus:ring-offset-0"
              placeholder="Search Interviews"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
          <MockInterviewTable globalFilterValue={globalFilter} query={queryResult} />
        </div>
      </CardContent>
    </Card>
  );
};

export default MockInterviewTab
type interviewsType = {
  name: string;
  id: string;
  createdAt: string; // ISO string from API
  type: string;
  role: string;
  difficultyLevel: string;
  isCompleted: boolean | null;
  feedBack?: string | null;
  totalScore?: number | null;
}[];

export const FetchMockInterviews = async () => {
  const res = await fetch(`/api/interview/getall`);
  const data: interviewsType = await res.json();
  return data.filter((x) => !x.isCompleted);
};

export const FetchInterviewHistory = async () => {
  const res = await fetch(`/api/interview/getall`);
  const data: interviewsType = await res.json();
  return data.filter((x) => x.isCompleted);
};
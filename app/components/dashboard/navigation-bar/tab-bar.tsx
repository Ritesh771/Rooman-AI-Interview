import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'


const tabItems = [
    { value: "Dashboard", key: "dashboard" },               // Overview of all activities, stats, recommendations
    // { value: "Live Interviews", key: "live_interviews" },   // Company-specific real-time interviews
    { value: "Take Interview", key: "mock_interviews" },   // AI-generated practice interviews
    { value: "Create Interview", key: "create_interview" }, // Build custom interview flows
    { value: "Interview History", key: "interview_history" }, // Review past interviews with feedback
    { value: "Profile", key: "complete_profile" }, // Complete user profile with resume data
];



const TabBar = () => {
    return (
        <TabsList className='gap-2.5 px-1 bg-white py-6 rounded-r-full rounded-l-full'>
            {
                tabItems.map((item, index) => <TabsTrigger className='py-5 text-sm px-3 duration-300 rounded-full hover:scale-105 hover:bg-[#e7e9fb]' key={index} value={item.key}>{item.value}</TabsTrigger>)
            }
        </TabsList>

    )
}

export default TabBar
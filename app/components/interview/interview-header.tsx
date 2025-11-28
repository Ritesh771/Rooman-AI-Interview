import React from 'react'
import dayjs from 'dayjs'

type props = {
    name: string,
    difficultyLevel: "Easy" | "Hard" | "Medium",
    type: string,
    createdAt: any,
    role: string
}

const InterviewHeader = ({ name, difficultyLevel, type, createdAt, role }: props) => {
    console.log(name, difficultyLevel);
    
    // Handle Firebase Timestamp objects and various date formats
    const parseDate = (dateValue: any): Date | null => {
        if (!dateValue) return null;
        
        // If it's already a number (timestamp)
        if (typeof dateValue === 'number') {
            return new Date(dateValue);
        }
        
        // If it has toDate method (Firebase Timestamp)
        if (dateValue?.toDate) {
            return dateValue.toDate();
        }
        
        // If it's already a Date object
        if (dateValue instanceof Date) {
            return dateValue;
        }
        
        // If it's a string, try to parse it
        if (typeof dateValue === 'string') {
            const parsed = new Date(dateValue);
            return isNaN(parsed.getTime()) ? null : parsed;
        }
        
        // If it's an object with seconds/nanoseconds (Firebase Timestamp-like)
        if (dateValue?.seconds !== undefined) {
            return new Date(dateValue.seconds * 1000 + (dateValue.nanoseconds || 0) / 1000000);
        }
        
        // Fallback
        return null;
    };
    
    const date = parseDate(createdAt);
    const formattedDate = date ? dayjs(date).format("MMM D, YYYY") : "Invalid Date";
    
    return (
        <section className='flex items-center flex-col gap-2 md:flex-row justify-between z-30'>
            <section className='flex items-center w-full flex-col md:flex-row gap-x-5'>
                <span className='text-[#1d243c] text-xl text-center font-bold'>{name}</span>
                <span className='text-[#1d243c] text-sm'>{formattedDate}</span>
                <span className='text-[#1d243c] text-sm'>{role}</span>
                <div className={`flex self-end md:self-start rounded-4xl px-2 text-center ${difficultyLevel == "Easy" ? "bg-[#46c6c2]" : difficultyLevel == "Medium" ? "bg-[#ffb700]" : "bg-[#f63737]"}`}>
                    <span className="text-center p-2 ">{difficultyLevel}</span>
                </div>
            </section>
            <span className='bg-[#5a5f7a] w-full max-w-fit self-end text-center md:self-start px-3 py-2 rounded-4xl text-white font-bold'>{type}</span>
        </section>
    )
}

export default InterviewHeader
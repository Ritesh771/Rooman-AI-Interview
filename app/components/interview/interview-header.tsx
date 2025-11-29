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
    console.log("InterviewHeader props:", { name, difficultyLevel, type, createdAt, role });
    console.log("createdAt type:", typeof createdAt);
    console.log("createdAt value:", createdAt);
    
    // Map internal type values to user-friendly display names
    const getDisplayType = (interviewType: string) => {
        if (interviewType?.startsWith('gemini-')) {
            return 'Aptitude Round';
        }
        // For coding interviews, the type might be different, but we can identify them by context
        // For now, return the type as-is for other cases
        return interviewType || 'Live Voice Interview';
    };
    
    const displayType = getDisplayType(type);
    
    // Handle Firebase Timestamp objects and various date formats
    const parseDate = (dateValue: any): Date | null => {
        console.log("parseDate input:", dateValue, "type:", typeof dateValue);

        if (!dateValue) {
            console.log("parseDate: dateValue is null/undefined");
            return null;
        }

        // If it's already a number (timestamp)
        if (typeof dateValue === 'number') {
            console.log("parseDate: treating as number timestamp");
            return new Date(dateValue);
        }

        // If it has toDate method (Firebase Timestamp)
        if (dateValue?.toDate && typeof dateValue.toDate === 'function') {
            console.log("parseDate: using toDate method");
            return dateValue.toDate();
        }

        // If it's already a Date object
        if (dateValue instanceof Date) {
            console.log("parseDate: already a Date object");
            return dateValue;
        }

        // If it's a string, try to parse it
        if (typeof dateValue === 'string') {
            console.log("parseDate: parsing string");
            const parsed = new Date(dateValue);
            const isValid = !isNaN(parsed.getTime());
            console.log("parseDate: string parse result:", parsed, "isValid:", isValid);
            return isValid ? parsed : null;
        }

        // If it's an object with seconds/nanoseconds (Firebase Timestamp-like)
        if (dateValue?.seconds !== undefined) {
            console.log("parseDate: treating as Firebase Timestamp object");
            return new Date(dateValue.seconds * 1000 + (dateValue.nanoseconds || 0) / 1000000);
        }

        // If it's an object with _seconds (Firestore Timestamp)
        if (dateValue?._seconds !== undefined) {
            console.log("parseDate: treating as Firestore Timestamp object");
            return new Date(dateValue._seconds * 1000 + (dateValue._nanoseconds || 0) / 1000000);
        }

        console.log("parseDate: fallback - returning null");
        // Fallback
        return null;
    };

    const date = parseDate(createdAt);
    console.log("Final parsed date:", date);
    const formattedDate = date ? dayjs(date).format("MMM D, YYYY") : "Invalid Date";
    console.log("Formatted date:", formattedDate);
    
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
            <span className='bg-[#5a5f7a] w-full max-w-fit self-end text-center md:self-start px-3 py-2 rounded-4xl text-white font-bold'>{displayType}</span>
        </section>
    )
}

export default InterviewHeader
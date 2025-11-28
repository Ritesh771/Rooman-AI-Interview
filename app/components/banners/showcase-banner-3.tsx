"use client";

import React, { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import Image from "next/image";

const interviewTips = [
    {
        head: "Overcome Interview Anxiety",
        subhead: "Nerves can cloud your thinking, causing hesitation, rambling, or forgetting key points. You want to feel calm and confident, not stressed under pressure. Our AI interviews simulate real job interview scenarios, giving you safe, repeatable practice to build composure and ace the real thing."
    },
    {
        head: "Master Unpredictable Questions",
        subhead: "Curveball questions, behavioral scenarios, or technical challenges can catch even the most prepared candidates off guard. You need to think on your feet and impress. With AI interviews, you'll face tough, realistic questions and get instant feedback to sharpen your responses—ensuring you're ready for anything."
    },
    {
        head: "Get the Feedback You Deserve",
        subhead: "Traditional practice often leaves you guessing where to improve—no constructive insights, just uncertainty. You want clarity on your strengths and weaknesses to stand out. Our AI interviews provide personalized, real-time feedback, helping you refine your delivery and showcase your best self to hiring managers."
    },
    {
        head: "Unlock Unlimited Practice Opportunities",
        subhead: "Scheduling interviews with friends or mentors can be tricky—conflicts, availability, and inconsistent feedback make it hard to prepare. You want reliable, high-quality practice on your terms. With AI interviews, practice anytime, anywhere, at your pace, so you're always interview-ready."
    },
    {
        head: "Showcase Your Strengths with Confidence",
        subhead: "Many candidates struggle to highlight their achievements and skills in a way that resonates with employers. You want to stand out and leave a lasting impression. AI interviews help you craft compelling narratives, eliminate filler words, and project confidence—ensuring you shine in every job interview."
    }
];

const ShowcaseBanner3 = () => {
    const [selected, setSelected] = useState<Record<string, boolean>>({});

    const selectAccordion = (id: string) => {
        setSelected((prev) => {
            if (prev[id]) {
                return {
                    ...prev,
                    [id]: !prev[id]
                }
            }

            for (const key in prev) {
                prev[key] = false;
            }

            return {
                ...prev,
                [id]: !prev[id]
            }
        });
    };

    return (
        <article className='pb-16'>
            <section className='flex flex-col md:flex-row justify-between gap-8 md:gap-12 pt-8 md:pt-12 pb-12 items-center'>
                <h2 className='text-3xl md:text-4xl font-bold text-center md:text-left bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                    How AI Interviews Can Help You Succeed
                </h2>
                <p className='max-w-2xl text-center md:text-left text-lg text-gray-700 leading-relaxed'>
                    Stop feeling unprepared and anxious. Discover how AI-powered interviews help you ace your next job interview with confidence.
                </p>
            </section>
            <section>
                <Accordion type="single" className='flex flex-col gap-6' collapsible>
                    {
                        interviewTips.map((item, index) => {
                            return (
                                <AccordionItem 
                                    className='border-0 rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300' 
                                    onClick={() => selectAccordion(index.toString())} 
                                    key={index} 
                                    value={`item-${index}`}
                                >
                                    <AccordionTrigger 
                                        className={`transition-all duration-300 flex justify-between items-center p-6 md:p-8 w-full text-left ${
                                            selected[index.toString()] 
                                                ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white" 
                                                : "bg-white text-gray-900 hover:bg-gray-50"
                                        }`}
                                    >
                                        <div className='flex items-center gap-4'>
                                            <span className={`text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-full ${
                                                selected[index.toString()] 
                                                    ? "bg-white text-blue-600" 
                                                    : "bg-blue-100 text-blue-600"
                                            }`}>
                                                0{index + 1}
                                            </span>
                                            <span className='text-xl md:text-2xl font-bold'>{item.head}</span>
                                        </div>
                                        <div className={`transform transition-transform duration-300 ${
                                            selected[index.toString()] ? 'rotate-180' : ''
                                        }`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className={`bg-white p-6 md:p-8 transition-all duration-300 ${
                                        selected[index.toString()] 
                                            ? "border-t border-gray-200" 
                                            : ""
                                    }`}>
                                        <p className='text-gray-700 text-lg leading-relaxed'>{item.subhead}</p>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })
                    }
                </Accordion>
            </section>
        </article>
    )
}

export default ShowcaseBanner3
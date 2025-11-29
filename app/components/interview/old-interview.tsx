"use client";

import React, { useEffect } from 'react'
import InterviewCard from './interview-card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel'
import { vapi } from "@/lib/vapi.sdk";


const PastInterviewLayout = () => {

    return (
        <article className='flex flex-col mt-[32px] gap-y-4'>
            <h2 className='font-bold text-2xl'>Your Past Interviews</h2>


            <Carousel
                opts={{
                    align: "start",
                }}
                className="w-full "
            >
                <CarouselContent>
                    {Array.from({ length: 7 }).map((_, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                            <InterviewCard />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className='text-amber-800' />
                <CarouselNext className='text-amber-800' />
            </Carousel>
        </article>
    )
}

export default PastInterviewLayout
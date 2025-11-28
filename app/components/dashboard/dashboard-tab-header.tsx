"use client";

import React from 'react'


type DashboardHeaderProps = {
    completedInterViews: number,
    totalInterViews:number,
    userName?: string
}


const DashboardTabHeader = (props: DashboardHeaderProps) => {
    return (
        <div className='flex gap-5 flex-col items-center md:items-start'>
            <h2 className='text-4xl z-10'>Welcome in, <span className='font-semibold'>{props.userName || 'User'}</span></h2>
            <div className='flex w-full items-center md:flex-row flex-col gap-10 md:items-start justify-between'>

                <div className="flex justify-between items-center flex-col md:flex-row gap-2">
                    {/* Mock Interview */}
                    <div className="flex z-10 gap-2 w-full flex-row md:flex-col justify-between items-center md:items-start">
                        <h1>Mock Interview</h1>
                        <div className="relative z-10 self-end w-[160px] md:w-[200px] bg-[#5a5f7a] text-black text-sm rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-[repeating-linear-gradient(45deg,_transparent,_transparent_4px,_#e7e9fb_2px,_#000_6px)]"
                                style={{ width: `85%` }}
                            />
                            <div className="relative text-xl p-3 pl-5 text-white font-semibold">85%</div>
                        </div>
                    </div>
                </div>


                <div className='flex flex-wrap sm:flex-row justify-around items-center z-10 gap-10'>
                    {/* <div className='flex relative items-center md:items-end justify-end flex-col'>
                        <span className='text-5xl md:text-6xl'>04</span>
                        <h2 className='text-sm'>Live Interviews</h2>
                    </div> */}
                    <div className='flex  gap-0  items-center sm:items-end justify-end flex-col'>
                        <span className='text-5xl md:text-6xl'>{props.totalInterViews == 0 ? "00" : props.totalInterViews}</span>
                        <h2 className='text-sm'>Mock Interviews </h2>
                    </div>
                    <div className='flex  items-center sm:items-end justify-end flex-col'>
                        <span className='text-5xl md:text-6xl'>{props.completedInterViews == 0 ? "00" : props.completedInterViews}</span>
                        <h2 className='text-sm'>Completed Mock Interviews </h2>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardTabHeader
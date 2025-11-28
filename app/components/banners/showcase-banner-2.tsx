import React from 'react'
import Image from "next/image";

const ShowcaseBanner2 = () => {
    return (
        <article className="bg-gradient-to-r from-blue-50 to-indigo-50 h-full relative flex flex-col lg:flex-row items-center justify-between p-8 md:p-12 lg:p-16 mt-12 mb-12 md:mt-16 md:mb-16 rounded-[45px] gap-8 md:gap-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            
            <section className="relative z-10 flex flex-col gap-6 items-center lg:items-start max-w-2xl">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center lg:text-left text-gray-900">
                    Smarter Practice. Sharper Performance.
                </h2>
                <p className="text-base md:text-lg text-center lg:text-left text-gray-700 leading-relaxed">
                    Whether you're preparing for behavioral, technical, or niche interviews,
                    <strong className="text-blue-700"> AI Interview </strong> 
                    adapts to your needs. Get real-time, tailored feedback to improve your delivery, boost your confidence, and master every question. Ready to level up your interview game? Try it today and feel the difference.
                </p>
            </section>
            
            <div className="relative z-10 hidden lg:block">
                <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full blur-2xl opacity-30"></div>
                    <Image
                        src="/questionsbro.svg"
                        height={400}
                        width={400}
                        className="object-contain relative z-10"
                        alt="Interview preparation illustration"
                    />
                </div>
            </div>
        </article>
    )
}

export default ShowcaseBanner2
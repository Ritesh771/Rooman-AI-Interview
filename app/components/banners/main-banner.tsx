import React from 'react'
import Image from "next/image";
import Link from "next/link";
import { Button } from '../ui/button';

const MainBanner = () => {
    return (
        <section className="pt-16 md:pt-20 pb-16 md:pb-20 xl:rounded-4xl items-center md:w-full justify-between flex flex-col-reverse xl:flex-row gap-8 md:gap-12">
            <div className='flex items-center xl:items-start gap-6 md:gap-8 flex-col max-w-2xl'>
                <div className='flex gap-6 flex-col items-center xl:items-start'>
                    <h1 className='text-center xl:text-left text-4xl sm:text-5xl md:text-6xl leading-tight font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                        NeuroSync – Your Ultimate Online Interview Practice Tool
                    </h1>
                    <div className="relative">
                        <Image 
                            className='visible xl:hidden items-center w-full max-w-[300px] sm:max-w-[400px] mx-auto' 
                            src={"/chatbot.png"} 
                            height={500} 
                            width={620} 
                            alt='AI Interview Assistant'
                        />
                    </div>
                    <p className='text-center xl:text-left text-lg md:text-xl leading-relaxed text-gray-700'>
                        Face the toughest interviews in the world—rigorous standards, intense questions, and zero room for error. Practice with industry giants and gain the confidence and skills you need to ace any real interview with ease.
                    </p>
                </div>
                <Link href={"/dashboard"}>
                    <Button className='bg-gradient-to-r from-blue-600 to-indigo-700 text-xl md:text-2xl text-white cursor-pointer px-8 md:px-10 py-6 md:py-8 hover:from-blue-700 hover:to-indigo-800 border-0 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold'>
                        Start an Interview
                    </Button>
                </Link>
            </div>
            <div className="relative">
                <div className="absolute -top-6 -right-6 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <Image 
                    className='hidden xl:block items-end w-[600px] md:w-[700px] self-end' 
                    src={"/chatbot.png"} 
                    height={600} 
                    width={920} 
                    alt='AI Interview Assistant'
                />
            </div>
        </section>
    )
}

export default MainBanner
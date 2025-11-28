import React from 'react'
import Image from "next/image";
import Link from "next/link";
import { Button } from '../ui/button';

const MainBanner = () => {
    return (
        <section className="pt-20 h-full pb-20 xl:rounded-4xl items-center md:w-full justify-between flex flex-col-reverse xl:flex-row gap-8">
            <div className='flex items-center xl:items-start gap-6 flex-col '>
                <div className='flex gap-6 flex-col items-center'>
                    <h2 className='text-center xl:text-left text-5xl leading-[52px] font-semibold'>NeuroSync – Your Ultimate Online Interview Practice Tool</h2>
                    <Image className='visible xl:hidden items-center w-full max-w-[400px]' src={"/robot.png"} height={500} width={620} alt='robot'></Image>
                    <span className='text-center xl:text-left text-[18px] leading-[28px] lg:text-lg'>Face the toughest mock interviews in the world—rigorous standards, intense questions, and zero room for error. Practice with industry giants and gain the confidence and skills you need to ace any real interview with ease.</span>
                </div>
                <Link href={"/dashboard"}>
                    <Button className='bg-dark text-xl md:text-2xl text-white cursor-pointer px-10 py-8 hover:text-black hover:bg-white border-black border-[1px]'>Start an Interview</Button>
                </Link>
            </div>
            <Image className='hidden xl:block items-end w-[800px] self-end' src={"/robot.png"} height={600} width={920} alt='robot'></Image>
        </section>
    )
}

export default MainBanner
"use client";

import React from 'react'
import UserProfileIcon from "../../auth/user-profile-icon";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import TabBar from './tab-bar';


const DashboardNavBar = () => {
    const pathname = usePathname();
    const isProfilePage = pathname === '/profile';

    return (
        <div className='pt-10 pb-5 hidden lg:flex flex-row justify-between z-10'>
            <Link href={"/"}>
                <h3 className='text-3xl hover:bg-[#bec8ff] border-[1px] border-black rounded-3xl px-3 py-2.5 font-semibold flex items-center'>NeuroSync</h3>
            </Link>
            <div className='flex flex-row items-center gap-2.5'>
                <TabBar />
                <UserProfileIcon isOptionEnabled={false} />
            </div>
        </div>
    )
}

export default DashboardNavBar
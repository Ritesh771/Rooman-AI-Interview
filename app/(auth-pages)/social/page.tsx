"use client";

import { Button } from '@/app/components/ui/button'
import React from 'react'
import Image from 'next/image';
import { signIn } from 'next-auth/react';


const SocialAccount = () => {

    const signInWithGoogle = async() => {
        signIn("google", {
            redirectTo:"/"
        })
    }

    return (
        <Button
            onClick={signInWithGoogle}
            className="bg-white text-dark border-2 hover:border-blue-200 border-gray-200 p-[22px] text-md font-semibold rounded-4xl cursor-pointer hover:bg-white"
        >
            <Image src="/google.webp" height={20} width={20} alt="google" />
            Sign in with Google
        </Button>
    )
}

export default SocialAccount
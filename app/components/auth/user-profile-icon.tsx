'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import React from 'react';

import Image from "next/image";
import { signOut } from "next-auth/react";
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type UserProfileTypes = {
    isOptionEnabled?: boolean
}

const UserProfileIcon = (prop: UserProfileTypes) => {
    const { data: Session } = useSession();

    // If isOptionEnabled is false, render just the image without dropdown
    if (prop.isOptionEnabled === false) {
        return (
            Session &&
            <Image
                src={Session.user?.image ?? "/logo.png"}
                className="rounded-full object-center"
                height={42}
                width={42}
                alt="user image"
            />
        );
    }

    return (
        Session &&
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Image
                    src={Session.user?.image ?? "/logo.png"}
                    className="rounded-full object-center cursor-pointer"
                    height={42}
                    width={42}
                    alt="user image"
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => signOut({redirectTo:"/"})}>
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserProfileIcon;

'use client';

import { signOut } from "next-auth/react";
import { Button } from "@/app/components/ui/button";

export function SignOutButton() {
    return (
        <Button onClick={() => signOut({redirectTo:"/"})} variant="destructive">
            Sign out
        </Button>
    );
}

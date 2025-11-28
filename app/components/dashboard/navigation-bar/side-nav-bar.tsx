import Link from "next/link";
import { TabsList, TabsTrigger } from "../../ui/tabs";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { SignOutButton } from "../../auth/sign-out";
import { Dispatch, SetStateAction } from "react";


const Tabitems = [
    { value: "Dashboard", key: "dashboard" },        
    { value: "Mock Interviews", key: "mock_interviews" },  
    { value: "Create Interview", key: "create_interview" }, 
    { value: "Interview History", key: "interview_history" }, 
    { value: "Profile", key: "complete_profile" }, 
];

export type AppSideBar = {
    callBack: Dispatch<SetStateAction<boolean>>;
}

export function AppSidebar(AppSideBarProp: AppSideBar) {
    const user = useSession().data?.user;
    return (
        <div className="w-2/3 h-full max-w-[300px] transform translate-x-0 opacity-100 transition-all duration-[5s] ease-in-out fixed lg:hidden z-100  items-center py-10 flex flex-col top-0 left-0 bg-white">
            <Link href={"/"}>
                <h3 className='text-3xl hover:bg-[#bec8ff] border-[1px] border-black rounded-3xl px-3 py-2.5 font-semibold flex items-center'>NeuroSync</h3>
            </Link>
            <TabsList className='gap-6 h-fit bg-transparent px-1 flex-col items-center py-6 rounded-r-full rounded-l-full'>
                {
                    Tabitems.map((item, index) => <TabsTrigger onClick={() => AppSideBarProp.callBack(() => false)} className='py-1 px-3 h-[16px] text-sm rounded-2xl' key={index} value={item.key}>{item.value}</TabsTrigger>)
                }
            </TabsList>
            {
                user &&
                <section className="items-end flex justify-items-end h-full w-full">
                    <div className="flex items-center self-end justify-between gap-4 w-full">
                        <Link href="/profile" className="flex items-center gap-2">
                            <Image src={user?.image ?? "/"} height={40} width={40} className="rounded-full" alt={user?.name as string ??
                                +"use image"
                            } ></Image>
                            <span className="text-sm">Profile</span>
                        </Link>
                        <SignOutButton />
                    </div>
                </section>
            }
        </div>
    )
}
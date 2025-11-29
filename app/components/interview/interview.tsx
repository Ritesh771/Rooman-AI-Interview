"use client";

import React, {useEffect} from 'react';
import Image from "next/image";
import {Button} from "@/app/components/ui/button";
import {vapi} from "@/lib/vapi.sdk";


interface SavedMessage {
    role: 'assistant' | 'user',
    content: string
}

const Interview = () => {
    const [callStart, setCallStart] = React.useState(false);
    const [isSpeaking, setIsSpeaking] = React.useState(false);
    const [savedMessage, setsavedMessage] = React.useState<SavedMessage[]>([]);
    const [lastMessage, setLastMessage] = React.useState("");

    useEffect(() => {
        setCallStart(false);
        setsavedMessage([]);

        const onMessage = (message: any) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const newMessage = {role: message.role, content: message.transcript};
                setsavedMessage((prev) => [...prev, newMessage]);
            }
        };

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onCallStart = () => setCallStart(true);
        const onCallEnd = () => setCallStart(false);

        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);

        return () => {
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
        }
    }, [])

    const handleCallConnect = async () => {
        if (!process.env.NEXT_PUBLIC_VAPI_ASSISTANT_WORKFLOW_ID)
            console.error('no workflow id found');
    
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_WORKFLOW_ID);
    }

    const handleCallStop = () => {
        setCallStart(false);
        vapi.stop();
    }

    useEffect(() => {
        const latestMessage = savedMessage[savedMessage.length - 1]?.content ?? "";
        setLastMessage(latestMessage)
        console.log(savedMessage)
    }, [savedMessage]);


    return (
        <article className="mt-8 flex flex-col gap-10">
            <h2 className="text-2xl font-semibold">Customize your mock interview to suit your needs...</h2>
            <section className="flex gap-12 flex-1 items-center flex-row justify-center w-full">
                <div
                    className="flex-col gap-y-1 flex items-center justify-center h-[320px] border-2 border-[#CAC5FE] rounded-2xl w-full  md:w-1/2 bg-gradient-to-b from-[#181537] to-[#0C0B16]">
                    <div className="relative flex flex-col items-center justify-center">
                        {
                            isSpeaking &&
                            <>
                                <div
                                    className="absolute w-[120px] h-[120px] bg-[#CAC5FE] bg-opacity-45 rounded-full animate-ping"></div>
                                <div
                                    className="absolute w-[120px] h-[120px] bg-[#CAC5FE] bg-opacity-30 rounded-full animate-ping delay-[1s]"></div>
                            </>
                        }
                        <div
                            className="relative bg-gradient-to-b from-[#FFFFFF] to-[#CAC5FE] rounded-full flex items-center justify-center w-[140px] h-[140px] z-10">
                            <Image className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                   src="/ai-image.png"
                                   height={80}
                                   width={80}
                                   alt="ai image"
                            />
                        </div>
                    </div>
                    <h3 className="text-3xl font-semibold">NeuroSync Interviewer</h3>
                </div>

                <div
                    className=" hidden md:flex relative flex-col gap-y-1 max-w-[500px] h-[320px]  border-2 border-[#CAC5FE] flex-1 rounded-2xl items-center justify-center w-1/2 bg-gradient-to-b from-[#1A1C20] to-[#08090D]">
                    <div className="relative w-full flex flex-col items-center justify-center">
                        <div className="rounded-full flex items-center justify-center w-[140px] h-[140px] z-10">
                            <Image className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                   src="/profile-image.png"
                                   height={140}
                                   width={140}
                                   alt="ai image"
                            />
                        </div>
                    </div>
                    <h3 className="text-3xl font-semibold">Yuvaraj (You)</h3>
                </div>
            </section>
            <section
                className=" rounded-full flex-col flex item-center justify-center gap-4 border-2px border-[#4B4D4F66]">
                {
                    callStart &&
                    <span
                        className="bg-gradient-to-b from-[#1A1C20] to-[#08090D] text-center p-4 text-lg">{lastMessage}</span>
                }
                <div className="flex flex-row gap-3 items-center justify-center w-full">
                    {
                        !callStart &&
                        <Button onClick={handleCallConnect}
                                className="bg-[#32de84] hover:bg-[#32de84] rounded-full pb-[16px] pt-[16px] p-6  hover:opacity-60">
                            Start interview
                        </Button>
                    }

                    <Button disabled={!callStart} onClick={handleCallStop}
                            className="bg-[#F75353] pt-[16px] pb-[16px] rounded-full p-6 hover:bg-[#F75353] hover:opacity-60">
                        Leave interview
                    </Button>
                </div>
            </section>
        </article>
    );
};

export default Interview;
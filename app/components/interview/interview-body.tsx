"use client";
import { handleCompleteInterviewAction } from "@/app/lib/form-actions";
import { vapi } from "@/lib/vapi.sdk";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useTransition } from "react";


export interface SavedMessage {
    role: 'assistant' | 'user',
    content: string
}

type CompleteInterviewType = {
    id: string,
    conversation: SavedMessage[];
    userid: string | undefined;
}

export const interviewer: CreateAssistantDTO = {
    name: "Interviewer",
    firstMessage:
        "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
    transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en",
    },
    voice: {
        provider: "11labs",
        voiceId: "sarah",
        stability: 0.4,
        similarityBoost: 0.8,
        speed: 0.9,
        style: 0.5,
        useSpeakerBoost: true,
    },
    model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: `You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.
  
                Interview Guidelines:
                Follow the structured question flow:
                {{questions}}

                Engage naturally & react appropriately:
                Listen actively to responses and acknowledge them before moving forward.
                Ask brief follow-up questions if a response is vague or requires more detail.
                Keep the conversation flowing smoothly while maintaining control.
                Be professional, yet warm and welcoming:

                Use official yet friendly language.
                Keep responses concise and to the point (like in a real voice interview).
                Avoid robotic phrasing—sound natural and conversational.
                Answer the candidate’s questions professionally:

                If asked about the role, company, or expectations, provide a clear and relevant answer.
                If unsure, redirect the candidate to HR for more details.

                Conclude the interview properly:
                Thank the candidate for their time.
                Inform them that the company will reach out soon with feedback.
                End the conversation on a polite and positive note.


                - Be sure to be professional and polite.
                - Keep all your responses short and simple. Use official language, but be kind and welcoming.
                - This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
                          },
        ],
    },
};

type InterviewBodyprops = {
    id: string
    questions: string;
    startInterview: boolean;
    handleLastMessageChange: (message: string) => void;
    isHangingUp: boolean;
}



const InterviewBody = ({ id, questions, startInterview, handleLastMessageChange, isHangingUp }: InterviewBodyprops) => {

    const session = useSession();

    const [callStart, setCallStart] = React.useState(false);
    const [isSpeaking, setIsSpeaking] = React.useState(false);
    const [savedMessage, setsavedMessage] = React.useState<SavedMessage[]>([]);
    const [isPending, startTransition] = useTransition();

    const router = useRouter();

    useEffect(() => {
        setCallStart(false);
        setsavedMessage([]);

        const onMessage = (message: any) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const newMessage = { role: message.role, content: message.transcript };
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

    useEffect(() => {
        if (savedMessage.length > 0) {
            const last = savedMessage[savedMessage.length - 1];
            if (last?.content) {
                handleLastMessageChange(last.content);
            }
        }
    }, [savedMessage]);

    const handlehangUp = useCallback(async () => {
        const completeInterviewData: CompleteInterviewType = {
            id: id,
            userid: session.data?.user?.id,
            conversation: savedMessage
        }

        startTransition(() => {
            if (session.data?.user?.id)
                handleCompleteInterviewAction(completeInterviewData);
        })
    }, [savedMessage])


    useEffect(() => {
        if (isHangingUp) {
            handleCallStop();
            handlehangUp();
            if (isPending == false)
                router.push("/dashboard");
        }
    }, [isHangingUp, isPending])

    useEffect(() => {
        if (startInterview) handleCallConnect();
    }, [startInterview])

    const handleCallConnect = async () => {
        await vapi.start(interviewer, {
            variableValues: {
                questions: questions,
            }
        });
    }

    const handleCallStop = () => {
        setCallStart(false);
        vapi.stop();
    }

    return (
        <section className="flex items-center justify-center gap-6 z-60">

            <div className="flex flex-col items-center justify-center h-[400px] w-full max-w-xl p-6 border-2 border-black rounded-[45px] bg-[#e7e9fb] shadow-md ">
                <div className="relative w-60 h-60 flex items-center justify-center">
                    {
                        isSpeaking &&
                        <div className="absolute w-28 h-28 bg-[#f78c74]/45 rounded-full animate-ping z-10" />
                    }
                    <Image
                        src="/robot-orange.png"
                        alt="NeuroSync Interviewer"
                        width={240}
                        height={240}
                        className="rounded-full animate-pulse p-4 z-20 pointer-events-none"
                    />
                </div>
                <span className="text-xl font-semibold text-center">NeuroSync Interviewer</span>
            </div>

            <div className="hidden md:flex flex-col items-center justify-center h-[400px] w-full max-w-xl p-6 border-2 border-black rounded-[45px] bg-[#e7e9fb] shadow-md gap-4">
                <Image
                    src={session.data?.user?.image || "/profile-image.png"}
                    alt="User Image"
                    width={180}
                    height={180}
                    className="rounded-full pointer-events-none"
                />
                <span className="text-xl font-semibold text-center">
                    {session.data?.user?.name || "You"} (You)
                </span>
            </div>
        </section>
    );

}

export default InterviewBody
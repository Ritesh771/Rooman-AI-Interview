import React from 'react'

const containerItems = [
    {
        head: "Master Your",
        subhead: "Responses.",
        content: "Get precise, AI-driven feedback to sharpen your answers and make a lasting impression.",
        bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
        textColor: "text-blue-600"
    },
    {
        head: "Communicate with",
        subhead: "Confidence.",
        content: "AI-guided coaching helps you eliminate filler words and awkward pauses for smooth, professional delivery.",
        bgColor: "bg-gradient-to-br from-indigo-100 to-blue-100",
        textColor: "text-indigo-700"
    },
    {
        head: "Practice Real",
        subhead: "Scenarios.",
        content: "Simulate real interview settings so you feel calm, confident, and prepared when it matters most.",
        bgColor: "bg-gradient-to-br from-gray-900 to-black",
        textColor: "text-white"
    },
    {
        head: "Refine Your",
        subhead: "Delivery.",
        content: "Improve tone, pace, and clarity with detailed feedback tailored to your unique speaking style.",
        bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
        textColor: "text-blue-600"
    },
    {
        head: "Get Instant",
        subhead: "Insights.",
        content: "Receive real-time suggestions and scoring to track your progress and stay interview-ready.",
        bgColor: "bg-gradient-to-br from-indigo-100 to-blue-100",
        textColor: "text-indigo-700"
    },
    {
        head: "Ace Any",
        subhead: "Interview.",
        content: "From behavioral to technical interviews, practice across formats and industries with intelligent support.",
        bgColor: "bg-gradient-to-br from-gray-900 to-black",
        textColor: "text-white"
    }
];

const ShowCaseBanner1 = () => {
    return (<>
        <article className='pt-8 md:pt-16 pb-16'>
            <section className='flex flex-col md:flex-row justify-between gap-8 md:gap-12 pt-8 md:pt-12 pb-12 items-center'>
                <h2 className='text-3xl md:text-4xl font-bold text-center md:text-left bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                    Unlock Your Interview Success
                </h2>
                <p className='max-w-2xl text-center md:text-left text-lg text-gray-700 leading-relaxed'>
                    Transform your interview skills with AI-driven interviews that mimic real-world scenarios, helping you refine answers, eliminate mistakes, and boost confidence like never before.
                </p>
            </section>
            <section className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
                {
                    containerItems.map((item, index) => {
                        return (
                            <div 
                                key={index} 
                                className={`${item.bgColor} min-h-[280px] w-full flex flex-col gap-6 justify-between border border-gray-200 rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2`}
                            >
                                <h3 className="flex flex-col">
                                    <span className={`text-2xl font-bold ${item.textColor}`}>{item.head}</span>
                                    <span className={`text-2xl font-bold ${item.textColor}`}>{item.subhead}</span>
                                </h3>
                                <p className={`text-base ${item.bgColor.includes('black') ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                                    {item.content}
                                </p>
                            </div>
                        )
                    })
                }
            </section>
        </article>
    </>
    )
}

export default ShowCaseBanner1
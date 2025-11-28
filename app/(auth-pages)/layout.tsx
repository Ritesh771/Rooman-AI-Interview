import "../globals.css";
import { Space_Grotesk } from 'next/font/google'

const grotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-grotesk',
})

export const metadata = {
    title: 'NeuroSync',
    description: 'NeuroSync - AI Interview Platform',
}



export default function RootLayout({ children, }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${grotesk.className} h-full w-full`}>
            <body className="bg-[#FFFFFF] h-full w-full">
                {children}
            </body>
        </html>
    )
}

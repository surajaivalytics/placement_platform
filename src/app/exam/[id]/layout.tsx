
import React from 'react';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";

const inter = Inter({ subsets: ['latin'] });

export default async function ExamLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { id: string };
}) {
    // Await params for Next.js 15 compatibility
    const { id } = await params;

    // Fetch Session
    const session = await getServerSession(authOptions);
    const user = session?.user;

    // Fetch Test Details for Branding
    const test = await prisma.test.findUnique({
        where: { id },
        select: {
            title: true,
            company: true,
        }
    });

    // Branding Helpers
    const getBrandConfig = (companyName: string = '') => {
        const name = companyName.toLowerCase();
        if (name.includes('tcs')) return {
            logo: '/logos/tcs-1696999494.jpg',
            logoHeight: 40,
            hasIonBadge: true,
            headerColor: 'bg-[#181C2E]'
        };
        if (name.includes('wipro')) return {
            logo: '/logos/Wipro_Secondary-Logo_Color_RGB.png',
            logoHeight: 32,
            hasIonBadge: false,
            headerColor: 'bg-white border-b border-gray-200 text-gray-900'
        };
        if (name.includes('ibm')) return {
            logo: '/logos/IBM.png',
            logoHeight: 32,
            hasIonBadge: false,
            headerColor: 'bg-gray-900'
        };
        // Default
        return {
            logo: null,
            logoHeight: 0,
            hasIonBadge: false,
            headerColor: 'bg-[#1e293b]'
        };
    };

    const brand = getBrandConfig(test?.company || '');
    const isDarkHeader = brand.headerColor.includes('bg-[#') || brand.headerColor.includes('bg-gray') || brand.headerColor.includes('bg-blue');

    return (
        <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
            {/* Fixed Corporate Header */}
            <header className={`fixed top-0 left-0 right-0 h-16 z-50 shadow-md flex items-center px-4 md:px-6 justify-between ${brand.headerColor} ${isDarkHeader ? 'text-white' : 'text-gray-900'}`}>
                <div className="flex items-center gap-4">
                    {/* Dynamic Logo Area */}
                    <div className="flex items-center gap-4">
                        {brand.logo ? (
                            <div className="bg-white rounded px-3 py-1 h-10 w-28 flex items-center justify-center shadow-sm">
                                <Image
                                    src={brand.logo}
                                    alt={`${test?.company} Logo`}
                                    width={100}
                                    height={brand.logoHeight}
                                    className="object-contain h-full w-full"
                                />
                            </div>
                        ) : (
                            <div className="font-bold text-lg tracking-tight bg-white/10 px-3 py-1 rounded">
                                {test?.company || "MOCK EXAM"}
                            </div>
                        )}

                        {brand.hasIonBadge && (
                            <div className="hidden md:flex flex-col border-l border-gray-600 pl-4 py-0.5 justify-center">
                                <span className="font-bold text-sm tracking-wide leading-none text-white">iON</span>
                                <span className="text-[10px] text-gray-400 tracking-wider font-medium">Digital Assessment</span>
                            </div>
                        )}

                        {!brand.hasIonBadge && test?.title && (
                            <div className={`hidden md:block text-sm font-medium opacity-80 border-l ${isDarkHeader ? 'border-gray-600' : 'border-gray-300'} pl-4`}>
                                {test.title}
                            </div>
                        )}
                    </div>
                </div>

                <div className={`flex items-center gap-6 text-sm font-medium ${isDarkHeader ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="hidden lg:block flex items-center gap-2">
                        System: <span className="text-green-500 flex items-center gap-1 font-bold"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Secure</span>
                    </span>

                    <div className={`flex items-center gap-3 py-1 pl-3 pr-1 rounded-full border ${isDarkHeader ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                        <div className="text-right hidden sm:block">
                            <div className={`text-xs font-bold leading-none ${isDarkHeader ? 'text-white' : 'text-gray-900'}`}>{user?.name || "Candidate"}</div>
                            <div className="text-[10px] opacity-70 leading-none mt-0.5">ID: {user?.id?.slice(-8).toUpperCase() || "GUEST"}</div>
                        </div>
                        <div className={`relative w-8 h-8 rounded-full border overflow-hidden shrink-0 ${isDarkHeader ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-gray-300'}`}>
                            {/* Placeholder Avatar */}
                            <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white font-bold text-xs">
                                {(user?.name?.[0] || "C").toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="pt-16 min-h-screen flex flex-col">
                {children}
            </main>

        </div>
    );
}

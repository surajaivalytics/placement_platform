
"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";
// import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useSession } from "next-auth/react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const { data: session } = useSession();
    const pathname = usePathname();

    const isTestPage = pathname?.startsWith('/dashboard/test');

    return (
        <div className="flex h-screen w-full bg-slate-50/50 overflow-hidden">
            {/* Sidebar - Fixed on desktop, sliding on mobile under layout control */}
            {!isTestPage && (
                <Sidebar
                    mobileOpen={mobileOpen}
                    setMobileOpen={setMobileOpen}
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    setCollapsed={setCollapsed}
                    role={session?.user?.role}
                    user={session?.user}
                />
            )}

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden md:ml-0 transition-all duration-300">
                <div className={`transition-all duration-300 min-h-screen flex flex-col ${!isTestPage ? (collapsed ? 'md:pl-24' : 'md:pl-64') : ''}`}>
                    {/* <DashboardHeader setMobileOpen={setMobileOpen} /> */}

                    <div className="flex-1 w-full relative p-4 md:p-6 lg:p-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}

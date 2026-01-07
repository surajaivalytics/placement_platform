"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { name: "Features", href: "#features" },
        { name: "How It Works", href: "#how-it-works" },
        { name: "Pricing", href: "#pricing" },
        { name: "Testimonials", href: "#testimonials" },
        { name: "FAQ", href: "#faq" },
        { name: "Blog", href: "#blog" },
    ];

    return (
        <nav
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300 border-b border-transparent",
                isScrolled
                    ? "bg-[#020617]/80 backdrop-blur-md border-emerald-500/10 shadow-sm py-2"
                    : "bg-transparent py-4"
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* LOGO */}
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                        Aivalytics
                    </span>
                </Link>

                {/* DESKTOP NAV */}
                <div className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm font-medium text-gray-300 hover:text-emerald-400 transition-colors hover:underline underline-offset-4"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* ACTIONS */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="text-gray-300 hover:text-emerald-400 font-medium hover:bg-white/5">Log in</Button>
                    </Link>
                    <Link href="/signup">
                        <Button className="rounded-full px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow border border-emerald-500/20">
                            Get Started
                        </Button>
                    </Link>
                </div>

                {/* MOBILE TOGGLE */}
                <div className="md:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white hover:bg-white/10">
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {/* MOBILE MENU */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-[#020617]/95 backdrop-blur-xl border-b border-gray-800 shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-5 mt-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-base font-medium p-3 text-gray-200 hover:bg-white/5 rounded-lg transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="h-px bg-gray-800 my-2" />
                    <div className="flex flex-col gap-3">
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full justify-center border-gray-700 text-gray-300 hover:text-white hover:bg-white/10 bg-transparent">Log in</Button>
                        </Link>
                        <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                            <Button className="w-full justify-center shadow-md bg-emerald-600 hover:bg-emerald-700 text-white">Get Started</Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}

'use client';

import React from 'react';
import { CheckCircle2, Trophy, Clock, Code, Video } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const images = [
        "/images/image.png",
        "/images/image copy.png"
    ];
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen w-full flex bg-gray-50/50">
            {/* Background Decor (Grid) */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40"
                style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            {/* Background Network Nodes (Edges) */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Top Left */}
                <motion.div
                    className="absolute top-[10%] left-[5%]"
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-full h-full object-cover" />
                    </div>
                </motion.div>
                <div className="absolute top-[30%] left-[2%] opacity-60">
                    <div className="w-8 h-8 rounded-full bg-gray-200 border border-white" />
                </div>

                {/* Bottom Left */}
                <motion.div
                    className="absolute bottom-[20%] left-[8%]"
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop" className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" alt="" />
                </motion.div>
                <div className="absolute bottom-[10%] left-[3%] opacity-40">
                    <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100" />
                </div>

                {/* Top Right */}
                <motion.div
                    className="absolute top-[15%] right-[8%]"
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 6.1, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop" className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" alt="" />
                </motion.div>
                <motion.div
                    className="absolute top-[8%] right-[2%]"
                    animate={{ y: [0, -18, 0] }}
                    transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://i.pravatar.cc/100?img=2" alt="User" className="w-full h-full object-cover" />
                    </div>
                </motion.div>

                {/* Bottom Right */}
                <motion.div
                    className="absolute bottom-[25%] right-[5%]"
                    animate={{ y: [0, -14, 0] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
                >
                    <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center border-2 border-white shadow-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://i.pravatar.cc/100?img=3" alt="User" className="w-full h-full object-cover" />
                    </div>
                </motion.div>
                <div className="absolute bottom-[10%] right-[10%] opacity-50">
                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200" />
                </div>
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-[1200px] mx-auto min-h-screen flex items-center justify-center p-4 md:p-8 origin-center md:scale-80">
                <div className="bg-white w-full rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">

                    {/* Left Panel (AiValytics Decorative) */}
                    <div className="w-full md:w-[45%] bg-primary relative p-12 flex flex-col justify-between overflow-hidden">
                        {/* Brand Logo Placeholder */}
                        <div className="relative z-20">
                            <div className="flex flex-col group">
                                <span className="font-black text-2xl text-white leading-none tracking-tighter">AiValytics</span>
                                <span className="text-[8px] font-bold text-white/60 uppercase tracking-[0.2em] mt-1">Online Education</span>
                            </div>
                        </div>

                        {/* Central Image & Floating Cards */}
                        <div className="absolute inset-0 flex items-center justify-center translate-y-12">
                            {/* Person Image (Slideshow) */}
                            <div className="relative w-full h-full mb-32 flex items-center justify-center z-10">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={currentImageIndex}
                                        src={images[currentImageIndex]}
                                        alt="Professional"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1.35 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                        className="h-full w-full object-contain mix-blend-multiply drop-shadow-2xl opacity-90 absolute translate-y-8"
                                    />
                                </AnimatePresence>
                            </div>






                        </div>

                        {/* Bottom Card */}
                        <div className="relative z-20 bg-white/10 backdrop-blur-xl rounded-none border border-white/20 p-6 mx-auto w-full max-w-[320px] text-center mb-8">
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest text-xs">Join our community</h3>
                            <p className="text-sm text-white/80 font-medium italic">"Education is the movement from darkness to light."</p>
                        </div>
                    </div>

                    {/* Right Panel (Content) */}
                    <div className="w-full md:w-[55%] p-8 md:p-12 flex flex-col justify-center bg-white relative">
                        {/* Decorative connections */}
                        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent z-10" />
                        {children}
                    </div>

                </div>
            </div>
        </div>
    );
}

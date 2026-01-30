import React from 'react';
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoaderProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    text?: string;
    description?: string;
}

export function Loader({ size = "lg", className, text = "Loading...", description }: LoaderProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    return (
        <div className={cn("flex flex-col items-center justify-center min-h-[200px] w-full gap-4", className)}>
            <div className="relative flex items-center justify-center">
                {/* Outer Ring */}
                <div className={cn(
                    "absolute border-4 border-gray-100 rounded-full opacity-30",
                    sizeClasses[size]
                )} />

                {/* Spinning Gradient Ring */}
                <div className={cn(
                    "border-4 border-t-blue-600 border-r-blue-600 border-b-transparent border-l-transparent rounded-full animate-spin",
                    sizeClasses[size]
                )} />

                {/* Inner Pulse (Optional decorative element) */}
                {/* <div className="absolute w-2 h-2 bg-blue-600 rounded-full animate-pulse" /> */}
            </div>

            {(text || description) && (
                <div className="text-center space-y-1 animate-pulse">
                    {text && <h3 className="text-gray-900 font-medium text-sm md:text-base">{text}</h3>}
                    {description && <p className="text-gray-500 text-xs md:text-sm">{description}</p>}
                </div>
            )}
        </div>
    );
}

// Full page variant
export function FullScreenLoader({ text = "Please wait...", description }: { text?: string, description?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader size="xl" text={text} description={description} />
        </div>
    );
}

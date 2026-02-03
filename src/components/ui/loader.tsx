import React from 'react';
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LoaderProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    text?: string;
    description?: string;
}

export function Loader({ size = "lg", className, text, description }: LoaderProps) {
    const sizeClasses = {
        sm: 40,
        md: 80,
        lg: 120,
        xl: 200
    };

    const dimension = sizeClasses[size];

    return (
        <div className={cn("flex flex-col items-center justify-center min-h-[200px] w-full gap-4", className)}>
            <div className="relative flex items-center justify-center animate-pulse">
                <Image
                    src="/loader.png"
                    alt="Loading..."
                    width={dimension}
                    height={dimension}
                    className="object-contain"
                    priority
                />
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
export function FullScreenLoader({ text, description }: { text?: string, description?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader size="xl" text={text} description={description} />
        </div>
    );
}

export function Spinner({ className, size = 24 }: { className?: string, size?: number }) {
    return (
        <div className={cn("relative animate-pulse", className)} style={{ width: size, height: size }}>
            <Image
                src="/loader.png"
                alt="Loading"
                fill
                className="object-contain"
                sizes={`${size}px`}
            />
        </div>
    );
}

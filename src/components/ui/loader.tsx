import React from 'react';
import { cn } from "@/lib/utils";

interface LoaderProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    text?: string;
    description?: string;
}

export function Loader({ size = "lg", className, text, description }: LoaderProps) {
    const sizeClasses = {
        sm: "w-6 h-6 border-2",
        md: "w-10 h-10 border-4",
        lg: "w-16 h-16 border-4",
        xl: "w-24 h-24 border-4",
    };

    return (
        <div className={cn("flex flex-col items-center justify-center min-h-[200px] w-full gap-4", className)}>
            <div
                className={cn(
                    "rounded-full border-blue-500 border-t-transparent animate-spin",
                    sizeClasses[size]
                )}
            />

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
        <div
            className={cn("rounded-full border-2 border-blue-500 border-t-transparent animate-spin", className)}
            style={{ width: size, height: size }}
        />
    );
}

import { cn } from "@/lib/utils";

interface LoaderProps {
    className?: string;
    size?: "sm" | "default" | "lg" | "xl";
}

export function Loader({ className, size = "default" }: LoaderProps) {
    const sizeClasses = {
        sm: "w-5 h-5 border-2",
        default: "w-10 h-10 border-4",
        lg: "w-16 h-16 border-4",
        xl: "w-20 h-20 border-[5px]",
    };

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            <div className={cn("rounded-full border-blue-600/30", sizeClasses[size])}></div>
            <div className={cn("absolute rounded-full border-blue-600 border-t-transparent animate-spin", sizeClasses[size])}></div>
        </div>
    );
}

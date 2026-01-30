import { Loader } from "@/components/ui/loader";

export default function Loading() {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 z-50">
            <Loader
                size="xl"
                text="TCS NQT Exam Portal"
                description="Verifying System Integrity and Secure Environment..."
            />
        </div>
    );
}

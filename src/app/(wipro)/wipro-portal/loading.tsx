import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 z-50">
            <div className="flex flex-col items-center gap-6">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-purple-600 border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>

                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                        Initializing Ambit
                    </h3>
                    <p className="text-sm text-slate-400">Loading your digital assessment experience...</p>
                </div>
            </div>
        </div>
    );
}

import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 z-50">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <span className="font-bold text-blue-600 text-xs">TCS</span>
                        </div>
                    </div>
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-gray-900">Secure Environment</h3>
                    <p className="text-sm text-gray-500 animate-pulse">Verifying System Integrity...</p>
                </div>
            </div>
        </div>
    );
}

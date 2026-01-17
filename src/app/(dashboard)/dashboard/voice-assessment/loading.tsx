import { Loader2, Mic } from "lucide-react";

export default function Loading() {
    return (
        <div className="h-full min-h-[60vh] flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative p-4 bg-white rounded-full shadow-lg border border-purple-100">
                        <Mic className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
                <div className="text-center mt-4">
                    <h3 className="text-lg font-semibold text-gray-900">Calibrating Voice Engine</h3>
                    <p className="text-sm text-gray-500">Checking microphone and audio systems...</p>
                </div>
            </div>
        </div>
    );
}

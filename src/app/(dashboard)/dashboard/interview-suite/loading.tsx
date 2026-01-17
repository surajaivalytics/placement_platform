import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="h-full min-h-[60vh] flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-full shadow-lg border border-gray-100">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">Preparing Interview Suite</h3>
                    <p className="text-sm text-gray-500">Setting up AI interviewer and environment...</p>
                </div>
            </div>
        </div>
    );
}

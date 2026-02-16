import { Spinner } from "@/components/ui/loader";

export default function Loading() {
    return (
        <div className="h-full min-h-[60vh] flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Spinner size={64} />
                <div className="text-center mt-4">
                    <h3 className="text-lg font-semibold text-gray-900">Calibrating Voice Engine</h3>
                    <p className="text-sm text-gray-500">Checking microphone and audio systems...</p>
                </div>
            </div>
        </div>
    );
}

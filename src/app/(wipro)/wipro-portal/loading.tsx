import { Loader } from "@/components/ui/loader";

export default function Loading() {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 z-50">
            <Loader
                text="Initializing Ambit"
                description="Loading your digital assessment experience..."
                className="min-h-0"
            />
        </div>
    );
}

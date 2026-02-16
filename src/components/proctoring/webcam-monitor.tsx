"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Move } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function WebcamMonitor({ deviceId }: { deviceId?: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: deviceId ? { deviceId: { exact: deviceId } } : { width: 320, height: 240 }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasPermission(true);
            } catch (err) {
                console.error("Webcam access denied:", err);
                setHasPermission(false);
                toast.error("Camera access required for proctoring!");
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [deviceId]);

    if (hasPermission === false) {
        return (
            <div className="fixed bottom-4 right-4 z-50 bg-red-100 border-2 border-red-500 rounded-lg p-4 shadow-xl flex items-center gap-3 max-w-sm animate-pulse">
                <CameraOff className="w-8 h-8 text-red-600" />
                <div>
                    <h4 className="font-bold text-red-800">Camera Access Denied</h4>
                    <p className="text-xs text-red-700">Please enable camera to continue assessment.</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed bottom-4 right-4 z-50 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-gray-800"
        >
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={cn(
                    "w-full h-full object-cover transform scale-x-[-1]",
                    !hasPermission && "opacity-0"
                )}
            />

            {/* Loading State */}
            {(!hasPermission && hasPermission !== false) && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Label */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">REC</span>
            </div>

            <div className="absolute bottom-1 left-0 right-0 text-center pointer-events-none">
                <span className="text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    Live Proctoring
                </span>
            </div>
        </div>
    );
}

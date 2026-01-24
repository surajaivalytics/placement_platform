"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Move } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function WebcamMonitor() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240 }
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
    }, []);

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
        <motion.div
            drag
            dragMomentum={false}
            className={cn(
                "fixed z-50 shadow-2xl rounded-xl overflow-hidden bg-black border-2 border-gray-800 transition-all",
                isCollapsed ? "w-16 h-16 rounded-full bottom-4 left-4" : "w-48 h-36 bottom-6 left-6"
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {/* Control Bar (Only visible when expanded) */}
            {!isCollapsed && (
                <div className="absolute top-0 left-0 right-0 bg-black/60 p-1 flex justify-between items-center z-10 opacity-0 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] text-white font-mono">REC</span>
                    </div>
                    <Move className="w-3 h-3 text-white cursor-move" />
                </div>
            )}

            {/* Video Feed */}
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={cn(
                    "w-full h-full object-cover transform scale-x-[-1]",
                    !hasPermission && "opacity-0"
                )}
                onClick={() => setIsCollapsed(!isCollapsed)}
            />

            {/* Loading State or Collapsed Icon */}
            {(!hasPermission && hasPermission !== false) && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {isCollapsed && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
                    <Camera className="w-6 h-6 text-white" />
                </div>
            )}

            {/* Label */}
            {!isCollapsed && (
                <div className="absolute bottom-1 left-0 right-0 text-center">
                    <span className="text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        You
                    </span>
                </div>
            )}
        </motion.div>
    );
}

"use strict";
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner"; // Assuming sonner is used, or us basic alert
import { useRouter } from "next/navigation";

interface ProctoringConfig {
    preventTabSwitch?: boolean;
    preventContextMenu?: boolean;
    preventCopyPaste?: boolean;
    forceFullScreen?: boolean;
    onViolation?: (type: string, message: string) => void;
    onExitFullScreen?: () => void;
    enrollmentId?: string;
    roundId?: string;
    disabled?: boolean;
}

// ... imports

export function useProctoring({
    preventTabSwitch,
    preventContextMenu,
    preventCopyPaste,
    forceFullScreen,
    onViolation,
    onExitFullScreen,
    enrollmentId,
    roundId,
    disabled
}: ProctoringConfig = {}) {
    const [warnings, setWarnings] = useState<number>(0);
    const [isFullScreen, setIsFullScreen] = useState<boolean>(true);

    const hasEnteredFullScreen = useRef(false);

    // Store callbacks in refs to avoid restarting effects when they change
    const onViolationRef = useRef(onViolation);
    const onExitFullScreenRef = useRef(onExitFullScreen);

    useEffect(() => {
        onViolationRef.current = onViolation;
        onExitFullScreenRef.current = onExitFullScreen;
    }, [onViolation, onExitFullScreen]);

    const logViolation = useCallback((type: string, message: string) => {
        if (disabled) return;
        setWarnings((prev) => prev + 1);
        onViolationRef.current?.(type, message);

        // Remote logging
        if (enrollmentId && roundId) {
            fetch('/api/mock-drives/session/proctoring/violation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enrollmentId, roundId, type, message })
            }).catch(err => console.error("Failed to log violation remotely", err));
        }
    }, [enrollmentId, roundId]);

    // Tab Switching / Visibility Change
    useEffect(() => {
        if (!preventTabSwitch || disabled) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                logViolation("TAB_SWITCH", "You navigated away from the test window.");
            }
        };

        const handleBlur = () => {
            // Optional: strict focus check
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
        };
    }, [preventTabSwitch, logViolation]);

    // Context Menu (Right Click)
    useEffect(() => {
        if (!preventContextMenu || disabled) return;

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            logViolation("RIGHT_CLICK", "Right-click is disabled.");
        };

        document.addEventListener("contextmenu", handleContextMenu);
        return () => document.removeEventListener("contextmenu", handleContextMenu);
    }, [preventContextMenu, logViolation]);

    // Copy / Paste / Select
    useEffect(() => {
        if (!preventCopyPaste || disabled) return;

        const handleCopyPaste = (e: ClipboardEvent) => {
            e.preventDefault();
            logViolation("COPY_PASTE", "Copy/Paste is disabled.");
        };

        const handleSelectStart = (e: Event) => {
            e.preventDefault();
        }

        document.addEventListener("copy", handleCopyPaste);
        document.addEventListener("paste", handleCopyPaste);
        document.addEventListener("cut", handleCopyPaste);
        document.addEventListener("selectstart", handleSelectStart);

        return () => {
            document.removeEventListener("copy", handleCopyPaste);
            document.removeEventListener("paste", handleCopyPaste);
            document.removeEventListener("cut", handleCopyPaste);
            document.removeEventListener("selectstart", handleSelectStart);
        };
    }, [preventCopyPaste, logViolation]);

    // Full Screen Enforcement
    useEffect(() => {
        if (!forceFullScreen || disabled) return;

        const checkFullScreen = () => {
            if (!document.fullscreenElement) {
                setIsFullScreen(false);

                // ONLY trigger violation if we have previously successfully entered fullscreen
                if (hasEnteredFullScreen.current) {
                    if (onExitFullScreenRef.current) {
                        onExitFullScreenRef.current();
                    } else {
                        logViolation("FULLSCREEN_EXIT", "Exited full-screen mode.");
                    }
                }
            } else {
                setIsFullScreen(true);
                hasEnteredFullScreen.current = true;
            }
        };

        document.addEventListener("fullscreenchange", checkFullScreen);

        // Check immediately on mount
        checkFullScreen();

        return () => document.removeEventListener("fullscreenchange", checkFullScreen);
    }, [forceFullScreen, logViolation]);

    const enterFullScreen = async () => {
        try {
            await document.documentElement.requestFullscreen();
            setIsFullScreen(true);
        } catch (e) {
            console.error("Fullscreen error", e);
        }
    };

    return {
        warnings,
        isFullScreen,
        enterFullScreen
    };
}

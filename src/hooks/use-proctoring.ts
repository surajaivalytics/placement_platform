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
}

export function useProctoring(config: ProctoringConfig = {}) {
    const router = useRouter();
    const [warnings, setWarnings] = useState<number>(0);
    const [isFullScreen, setIsFullScreen] = useState<boolean>(true);

    const hasEnteredFullScreen = useRef(false);

    const logViolation = useCallback((type: string, message: string) => {
        setWarnings((prev) => prev + 1);
        config.onViolation?.(type, message);
    }, [config]);

    // Tab Switching / Visibility Change
    useEffect(() => {
        if (!config.preventTabSwitch) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                logViolation("TAB_SWITCH", "You navigated away from the test window.");
            }
        };

        const handleBlur = () => {
            // Optional: strict focus check
            // logViolation("WINDOW_BLUR", "Focus lost from the test window.");
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
        };
    }, [config.preventTabSwitch, logViolation]);

    // Context Menu (Right Click)
    useEffect(() => {
        if (!config.preventContextMenu) return;

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            logViolation("RIGHT_CLICK", "Right-click is disabled.");
        };

        document.addEventListener("contextmenu", handleContextMenu);
        return () => document.removeEventListener("contextmenu", handleContextMenu);
    }, [config.preventContextMenu, logViolation]);

    // Copy / Paste / Select
    useEffect(() => {
        if (!config.preventCopyPaste) return;

        const handleCopyPaste = (e: ClipboardEvent) => {
            e.preventDefault();
            logViolation("COPY_PASTE", "Copy/Paste is disabled.");
        };

        // Prevent selection
        const handleSelectStart = (e: Event) => {
            e.preventDefault();
            // Optional: Silent block or warn
            // logViolation("SELECTION", "Text selection is disabled.");
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
    }, [config.preventCopyPaste, logViolation]);

    // Full Screen Enforcement
    useEffect(() => {
        if (!config.forceFullScreen) return;

        const checkFullScreen = () => {
            if (!document.fullscreenElement) {
                setIsFullScreen(false);

                // ONLY trigger violation if we have previously successfully entered fullscreen AND prevent violations on initial load
                if (hasEnteredFullScreen.current) {
                    if (config.onExitFullScreen) {
                        config.onExitFullScreen();
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
    }, [config.forceFullScreen, logViolation, config.onExitFullScreen]);

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

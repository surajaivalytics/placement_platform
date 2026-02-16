"use client";

import React, { useState } from "react";
import { ChevronUp, ChevronDown, GripVertical } from "lucide-react";

interface SectionWrapperProps {
    id: string;
    title: string;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
    children: React.ReactNode;
    isEditable?: boolean;
}

export default function SectionWrapper({
    id,
    title,
    onMoveUp,
    onMoveDown,
    canMoveUp = true,
    canMoveDown = true,
    children,
    isEditable = true,
}: SectionWrapperProps) {
    const [isHovered, setIsHovered] = useState(false);

    if (!isEditable) {
        return <>{children}</>;
    }

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            data-section-id={id}
        >
            {/* Hover Border Indicator */}
            <div
                className={`absolute inset-0 border-2 border-dashed rounded-lg pointer-events-none transition-all duration-200 ${isHovered ? "border-blue-400 bg-blue-50/30" : "border-transparent"
                    }`}
            />

            {/* Floating Toolbar */}
            {/* Floating Toolbar */}
            {isHovered && (
                <div className="absolute -top-3 right-0 z-[100] flex items-center gap-1 bg-blue-600 rounded-full shadow-xl px-2 py-1 transform -translate-y-full ring-2 ring-white print:hidden">
                    {/* Section Label */}
                    <div className="flex items-center gap-1 text-white text-xs font-bold px-2 border-r border-blue-400 mr-1">
                        <GripVertical className="w-3 h-3" />
                        <span className="max-w-[100px] truncate uppercase tracking-wider">{title}</span>
                    </div>

                    {/* Move Up Button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMoveUp?.();
                        }}
                        disabled={!canMoveUp}
                        className={`p-1.5 rounded-full transition-all ${canMoveUp
                                ? "bg-blue-500 hover:bg-blue-400 text-white shadow-sm"
                                : "bg-blue-800 text-blue-400 cursor-not-allowed"
                            }`}
                        title="Move section up"
                    >
                        <ChevronUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down Button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMoveDown?.();
                        }}
                        disabled={!canMoveDown}
                        className={`p-1.5 rounded-full transition-all ${canMoveDown
                                ? "bg-blue-500 hover:bg-blue-400 text-white shadow-sm"
                                : "bg-blue-800 text-blue-400 cursor-not-allowed"
                            }`}
                        title="Move section down"
                    >
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Section Content */}
            <div className="relative">{children}</div>
        </div>
    );
}

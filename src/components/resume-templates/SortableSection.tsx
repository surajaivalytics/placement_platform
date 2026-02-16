"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableSectionProps {
    id: string;
    children: React.ReactNode;
    isEditable?: boolean;
}

export function SortableSection({ id, children, isEditable = true }: SortableSectionProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 50 : 'auto',
    };

    if (!isEditable) {
        return <div className="relative">{children}</div>;
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative border-2 border-transparent hover:border-blue-300 rounded-lg transition-all ${isDragging ? "bg-blue-50/50 ring-2 ring-blue-400" : ""
                }`}
            data-section-id={id}
        >
            {/* Drag Handle - Only visible on Group Hover */}
            <div
                {...attributes}
                {...listeners}
                className="absolute -top-3 -right-3 p-2 bg-white shadow-lg rounded-full cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 z-50 transition-opacity duration-200 border border-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 print:hidden"
                title="Drag to reorder"
            >
                <GripVertical size={16} />
            </div>

            {/* Content */}
            {children}
        </div>
    );
}

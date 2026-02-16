"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WIZARD_STEPS } from "@/lib/builder/builderTypes";

interface WizardNavProps {
    currentStep: number;
    canGoNext: boolean;
    onBack: () => void;
    onNext: () => void;
}

export default function WizardNav({
    currentStep,
    canGoNext,
    onBack,
    onNext
}: WizardNavProps) {
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === WIZARD_STEPS.length - 1;

    return (
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            {/* Back Button */}
            <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                disabled={isFirstStep}
                className={`h-12 px-6 ${isFirstStep
                    ? "opacity-0 pointer-events-none"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                    }`}
            >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            {/* Step Indicator */}
            <div className="flex items-center gap-2">
                {WIZARD_STEPS.map((step, index) => (
                    <div
                        key={step.id}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentStep
                            ? "w-8 bg-teal-500 shadow-sm"
                            : index < currentStep
                                ? "bg-slate-400"
                                : "bg-slate-200"
                            }`}
                    />
                ))}
            </div>

            {/* Next Button */}
            {!isLastStep && (
                <Button
                    type="button"
                    onClick={onNext}
                    disabled={!canGoNext}
                    className={`h-12 px-8 font-semibold shadow-lg transition-all duration-300 ${canGoNext
                        ? "bg-slate-900 text-white hover:bg-teal-600 shadow-teal-500/20"
                        : "bg-slate-300 cursor-not-allowed shadow-none"
                        }`}
                >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            )}

            {isLastStep && (
                <div className="w-[100px]" /> // Spacer for alignment
            )}
        </div>
    );
}

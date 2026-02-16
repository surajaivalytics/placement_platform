"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
    BuilderResumeData,
    WIZARD_STEPS,
} from "@/lib/builder/builderTypes";

import StepPersonal from "./steps/StepPersonal";
import StepExperience from "./steps/StepExperience";
import StepEducation from "./steps/StepEducation";
import StepSkills from "./steps/StepSkills";
import StepSummary from "./steps/StepSummary";
import StepExtras from "./steps/StepExtras";
import StepFinalReview from "./steps/StepFinalReview";
import WizardNav from "./WizardNav";

interface FormWizardProps {
    data: BuilderResumeData;
    onChange: (data: BuilderResumeData) => void;
    onDownload: () => void;
}

export default function FormWizard({ data, onChange, onDownload }: FormWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < WIZARD_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Validation per step (REWRITTEN AS REQUESTED)
    const isCurrentStepValid = () => {
        console.log("Validating Step:", currentStep, "Fresher:", data.isFresher, "Exp Length:", data.experience?.length); // DEBUG LOG

        switch (currentStep) {
            case 0: // Personal
                return !!(data.personal.firstName && data.personal.lastName && data.personal.email);

            case 1: // Experience
                return true; // <--- ALWAYS ALLOW NEXT (User can skip if Fresher)

            case 2: // Education
                return data.education.length > 0;

            case 3: // Skills
                return data.skills.length > 0;

            case 4: // Summary
                return data.summary.length > 20;

            default:
                return true;
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <StepPersonal
                        data={data.personal}
                        onChange={(personal) => onChange({ ...data, personal })}
                    />
                );
            case 1:
                return (
                    <StepExperience
                        experience={data.experience}
                        onExperienceChange={(experience) => onChange({ ...data, experience })}
                    />
                );
            case 2:
                return (
                    <StepEducation
                        education={data.education}
                        onChange={(education) => onChange({ ...data, education })}
                    />
                );
            case 3:
                return (
                    <StepSkills
                        skills={data.skills}
                        onChange={(skills) => onChange({ ...data, skills })}
                    />
                );
            case 4:
                return (
                    <StepSummary
                        summary={data.summary}
                        resumeData={data}
                        onChange={(summary) => onChange({ ...data, summary })}
                    />
                );
            case 5:
                return (
                    <StepExtras
                        data={data}
                        onChange={onChange}
                    />
                );
            case 6:
                return (
                    <StepFinalReview
                        data={data}
                        onDownload={onDownload}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Step Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-white bg-teal-500 px-3 py-1 rounded-full shadow-sm">
                        Step {currentStep + 1} of {WIZARD_STEPS.length}
                    </span>
                    <span className="text-sm text-slate-400">
                        {WIZARD_STEPS[currentStep].title}
                    </span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"
                        style={{ width: `${((currentStep + 1) / WIZARD_STEPS.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto pr-2">
                <AnimatePresence mode="wait">
                    {renderStep()}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <WizardNav
                currentStep={currentStep}
                canGoNext={isCurrentStepValid()}
                onBack={handleBack}
                onNext={handleNext}
            />
        </div>
    );
}

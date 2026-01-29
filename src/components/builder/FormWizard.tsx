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

    // Validation per step
    const canGoNext = (): boolean => {
        switch (currentStep) {
            case 0: // Personal
                return !!(
                    data.personal.firstName &&
                    data.personal.lastName &&
                    data.personal.email &&
                    data.personal.phone &&
                    data.personal.city &&
                    data.personal.country
                );
            case 1: // Experience
                // Fresher is valid, or must have at least one experience entry
                return data.isFresher || data.experience.length > 0;
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
                        isFresher={data.isFresher}
                        experience={data.experience}
                        onFresherChange={(isFresher) => onChange({ ...data, isFresher })}
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
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        Step {currentStep + 1} of {WIZARD_STEPS.length}
                    </span>
                    <span className="text-sm text-slate-400">
                        {WIZARD_STEPS[currentStep].title}
                    </span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
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
                canGoNext={canGoNext()}
                onBack={handleBack}
                onNext={handleNext}
            />
        </div>
    );
}

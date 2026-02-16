// Builder Resume Data Types
// Used for the multi-step wizard form

export interface BuilderPersonal {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    linkedin?: string;
}

export interface BuilderExperience {
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

export interface BuilderEducation {
    id: string;
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    score?: string; // CGPA or percentage
}

export interface BuilderLanguage {
    language: string;
    proficiency: "Native" | "Fluent" | "Intermediate" | "Beginner";
}

export interface BuilderCertification {
    id: string;
    name: string;
    issuer: string;
    year: string;
}

export interface BuilderCustomSection {
    id: string;
    title: string;
    content: string;
}

export interface BuilderResumeData {
    personal: BuilderPersonal;
    isFresher: boolean;
    experience: BuilderExperience[];
    education: BuilderEducation[];
    skills: string[];
    summary: string;
    // Optional additional details (Step 6)
    languages: BuilderLanguage[];
    certifications: BuilderCertification[];
    interests: string[];
    awards: string[]; // Separate from interests
    customSections: BuilderCustomSection[];
}

// Initial empty state for the wizard
export const initialBuilderData: BuilderResumeData = {
    personal: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        city: "",
        country: "",
        linkedin: "",
    },
    isFresher: false,
    experience: [],
    education: [],
    skills: [],
    summary: "",
    // Additional details (Step 6)
    languages: [],
    certifications: [],
    interests: [],
    awards: [],
    customSections: [],
};

// Generate unique ID for dynamic form entries
export const generateId = () => Math.random().toString(36).substring(2, 9);

// Create empty experience entry
export const createEmptyExperience = (): BuilderExperience => ({
    id: generateId(),
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
});

// Create empty education entry
export const createEmptyEducation = (): BuilderEducation => ({
    id: generateId(),
    school: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
});

// Wizard step configuration
export const WIZARD_STEPS = [
    { id: 0, title: "Personal Details", icon: "User" },
    { id: 1, title: "Experience", icon: "Briefcase" },
    { id: 2, title: "Education", icon: "GraduationCap" },
    { id: 3, title: "Skills", icon: "Lightbulb" },
    { id: 4, title: "Summary", icon: "FileText" },
    { id: 5, title: "Extras", icon: "Sparkles" },
    { id: 6, title: "Review", icon: "CheckCircle" },
] as const;

export type WizardStepId = typeof WIZARD_STEPS[number]["id"];

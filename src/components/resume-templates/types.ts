// Resume Data Types for all templates

export interface ContactInfo {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
}

export interface Experience {
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
}

export interface Education {
    degree: string;
    institution: string;
    location: string;
    date: string;
    gpa?: string;
}

export interface Language {
    name: string;
    proficiency: number; // 0-100
}

export interface CustomSection {
    title: string;
    content: string;
}

// Section ordering types
export type SectionKey =
    | 'summary'
    | 'experience'
    | 'education'
    | 'skills'
    | 'certifications'
    | 'languages'
    | 'awards'
    | 'interests'
    | 'customSections';

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
    'summary',
    'experience',
    'education',
    'skills',
    'certifications',
    'languages',
    'awards',
    'interests',
    'customSections',
];

export interface ResumeData {
    firstName: string;
    lastName: string;
    title: string;
    summary?: string;
    contact: ContactInfo;
    experience: Experience[];
    education: Education[];
    skills: string[];
    languages?: Language[];
    interests?: string[];
    awards?: string[]; // Awards & Honors - separate from interests
    certifications?: string[];
    customSections?: CustomSection[];
}

// Props for templates that support section reordering
export interface TemplateProps {
    data: ResumeData;
    sectionOrder?: SectionKey[];
    onMoveSection?: (sectionKey: SectionKey, direction: 'up' | 'down') => void;
    onReorder?: (newOrder: SectionKey[]) => void;
    isEditable?: boolean;
}

// Default sample data for preview
export const sampleResumeData: ResumeData = {
    firstName: "David",
    lastName: "Anderson",
    title: "Senior Software Engineer",
    summary: "Experienced software engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions.",
    contact: {
        email: "david.anderson@email.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        linkedin: "linkedin.com/in/davidanderson",
        website: "davidanderson.dev",
    },
    experience: [
        {
            role: "Senior Software Engineer",
            company: "Tech Solutions Inc.",
            location: "San Francisco, CA",
            startDate: "Jan 2021",
            endDate: "Present",
            bullets: [
                "Led development of microservices architecture serving 10M+ daily users",
                "Mentored team of 5 junior developers, improving code quality by 40%",
                "Implemented CI/CD pipelines reducing deployment time by 60%",
            ],
        },
        {
            role: "Software Engineer",
            company: "Innovation Labs",
            location: "Austin, TX",
            startDate: "Jun 2018",
            endDate: "Dec 2020",
            bullets: [
                "Developed RESTful APIs handling 1M+ requests per day",
                "Optimized database queries improving performance by 50%",
                "Collaborated with cross-functional teams on product launches",
            ],
        },
        {
            role: "Junior Developer",
            company: "StartUp Co.",
            location: "Boston, MA",
            startDate: "Aug 2016",
            endDate: "May 2018",
            bullets: [
                "Built responsive web applications using React and Node.js",
                "Participated in agile development sprints and code reviews",
            ],
        },
    ],
    education: [
        {
            degree: "Master of Science in Computer Science",
            institution: "Stanford University",
            location: "Stanford, CA",
            date: "2016",
            gpa: "3.9",
        },
        {
            degree: "Bachelor of Science in Software Engineering",
            institution: "MIT",
            location: "Cambridge, MA",
            date: "2014",
            gpa: "3.8",
        },
    ],
    skills: [
        "JavaScript/TypeScript",
        "React & Next.js",
        "Node.js",
        "Python",
        "AWS & Cloud Services",
        "Docker & Kubernetes",
        "PostgreSQL & MongoDB",
        "GraphQL",
        "CI/CD",
        "Agile/Scrum",
    ],
    languages: [
        { name: "English", proficiency: 100 },
        { name: "Spanish", proficiency: 75 },
        { name: "French", proficiency: 40 },
    ],
    interests: ["Open Source Contributing", "Tech Blogging", "Hiking", "Chess"],
};

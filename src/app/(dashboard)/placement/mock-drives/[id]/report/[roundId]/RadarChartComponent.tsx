'use client';

import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';

export default function RadarChartComponent({ scores }: { scores: any }) {
    const data = [
        { subject: 'Programming', A: scores?.programmingFundamentals || 0, fullMark: 10 },
        { subject: 'OOP', A: scores?.oopConcepts || 0, fullMark: 10 },
        { subject: 'DSA', A: scores?.dsaBasics || 0, fullMark: 10 },
        { subject: 'SDLC', A: scores?.sdlc || 0, fullMark: 10 },
        { subject: 'App Dev', A: scores?.appDev || 0, fullMark: 10 },
        { subject: 'Debugging', A: scores?.debugging || 0, fullMark: 10 },
        { subject: 'SQL', A: scores?.sqlBasics || 0, fullMark: 10 },
        { subject: 'Collaboration', A: scores?.collaboration || 0, fullMark: 10 },
    ];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} axisLine={false} tick={false} />
                <Radar
                    name="Performance"
                    dataKey="A"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.15}
                    strokeWidth={2}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}

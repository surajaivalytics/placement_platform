'use client';

import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';

export default function RadarChartComponent({ scores }: { scores: any }) {
    const data = [
        { subject: 'Logic', A: scores?.logicAndReasoning || 0, fullMark: 10 },
        { subject: 'Solving', A: scores?.problemSolving || 0, fullMark: 10 },
        { subject: 'DSA', A: scores?.algorithmDesign || 0, fullMark: 10 },
        { subject: 'Concepts', A: scores?.conceptualDepth || 0, fullMark: 10 },
        { subject: 'Fundamentals', A: scores?.programmingFundamentals || 0, fullMark: 10 },
        { subject: 'Debugging', A: scores?.debuggingAbility || 0, fullMark: 10 },
        { subject: 'Design', A: scores?.systemArchitecture || 0, fullMark: 10 },
        { subject: 'Precision', A: scores?.attentionToDetail || 0, fullMark: 10 },
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

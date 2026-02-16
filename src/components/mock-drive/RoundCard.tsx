'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RoundCardProps {
    round: any;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    isLocked: boolean;
    driveId: string;
}

export function RoundCard({ round, status, isLocked, driveId }: RoundCardProps) {
    const router = useRouter();

    const getStatusBadge = () => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
            case 'FAILED':
                return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
            case 'IN_PROGRESS':
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1" /> In Progress</Badge>;
            default:
                return <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">Pending</Badge>;
        }
    };

    const handleStart = () => {
        if (!isLocked) {
            router.push(`/placement/mock-drives/${driveId}/round/${round.id}`);
        }
    };

    return (
        <Card className={`relative overflow-hidden transition-all duration-300 ${isLocked ? 'opacity-75 bg-slate-50 border-slate-200' : 'hover:shadow-lg border-indigo-100 bg-white'}`}>
            {isLocked && (
                <div className="absolute inset-0 bg-slate-100/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <div className="p-3 bg-white rounded-full shadow-sm">
                            <Lock className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium uppercase tracking-wider">Locked</span>
                    </div>
                </div>
            )}

            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <Badge variant="outline" className="mb-2 text-[10px] tracking-wider font-bold text-slate-500 uppercase">
                            Round {round.roundNumber} - {round.type.replace('_', ' ')}
                        </Badge>
                        <CardTitle className="text-lg text-slate-800">{round.title}</CardTitle>
                    </div>
                    {getStatusBadge()}
                </div>
                <CardDescription className="line-clamp-2 text-sm mt-1">
                    {round.description || 'No description provided.'}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-4">
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{round.durationMinutes} mins</span>
                    </div>
                    {/* Add more metadata icons here if needed */}
                </div>

                <Button
                    className={`w-full group ${status === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    disabled={isLocked || status === 'COMPLETED' || status === 'FAILED'}
                    onClick={handleStart}
                >
                    {status === 'COMPLETED' ? (
                        <>View Result <CheckCircle className="w-4 h-4 ml-2" /></>
                    ) : status === 'IN_PROGRESS' ? (
                        <>Resume Round <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
                    ) : (
                        <>Start Round <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}

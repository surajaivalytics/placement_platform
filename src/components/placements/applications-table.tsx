import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Application {
    id: string;
    user: {
        name: string | null;
        email: string | null;
    };
    company: string;
    finalTrack: string | null;
    status: string;
    createdAt: string;
    assessmentStages: any[];
}

const statusStyles: Record<string, string> = {
    "completed": "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200",
    "selected": "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200",
    "interview": "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
    "voice": "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
    "coding": "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
    "rejected": "bg-red-50 text-red-500 border-red-200 hover:bg-red-100",
    "withdrawn": "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200",
    "eligibility_check": "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100",
    "default": "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
};

const getStatusStyle = (status: string) => {
    return statusStyles[status] || statusStyles.default;
};

const calculateProgress = (status: string) => {
    const stages = [
        "eligibility_check",
        "foundation",
        "advanced",
        "coding",
        "essay",
        "voice",
        "interview",
        "completed"
    ];
    const index = stages.indexOf(status);
    if (status === "selected") return 100;
    if (status === "rejected" || status === "withdrawn") return 0; // Or keep last known progress?
    if (index === -1) return 10;
    return Math.round(((index + 1) / stages.length) * 100);
};

const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export function ApplicationsTable() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await fetch('/api/admin/placements');
                if (res.ok) {
                    const data = await res.json();
                    setApplications(data.applications || []);
                }
            } catch (error) {
                console.error("Failed to fetch applications", error);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100/50 p-12 flex justify-center items-center">
                <Spinner size={32} className="text-blue-600" />
            </div>
        );
    }

    const isEmpty = applications.length === 0;

    if (isEmpty) {
        return (
            <div className="bg-white rounded-[20px] p-12 text-center shadow-sm border border-gray-100/50 flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No applications yet!</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Once candidates apply for placements, their application details and status will appear here.</p>
                <Button className="rounded-full h-11 px-8 bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg hover:shadow-xl transition-all text-white">
                    View Eligible Candidates
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100/50 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-800">Applications Overview</h3>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-gray-100">
                            <TableHead className="font-semibold text-gray-600 h-14 pl-6">Candidate Name</TableHead>
                            <TableHead className="font-semibold text-gray-600 h-14">Company</TableHead>
                            <TableHead className="font-semibold text-gray-600 h-14">Role / Track</TableHead>
                            <TableHead className="font-semibold text-gray-600 h-14">Status</TableHead>
                            <TableHead className="font-semibold text-gray-600 h-14">Applied On</TableHead>
                            <TableHead className="font-semibold text-gray-600 h-14">Progress</TableHead>
                            <TableHead className="font-semibold text-gray-600 h-14 pr-6 text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.map((app) => {
                            const progress = calculateProgress(app.status);
                            return (
                                <TableRow key={app.id} className="hover:bg-emerald-50/30 transition-colors border-gray-100 group">
                                    <TableCell className="font-medium text-gray-900 pl-6 py-4">
                                        <div className="flex flex-col">
                                            <span>{app.user.name || "Unknown User"}</span>
                                            <span className="text-xs text-gray-400 font-normal">{app.user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600 py-4">{app.company}</TableCell>
                                    <TableCell className="text-gray-600 py-4 font-medium">{app.finalTrack || "N/A"}</TableCell>
                                    <TableCell className="py-4">
                                        <Badge variant="outline" className={cn("rounded-md px-3 py-1 font-medium border whitespace-nowrap", getStatusStyle(app.status))}>
                                            {app.status === "completed" && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                                            {app.status === "selected" && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                                            {app.status === "rejected" && <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                                            {["coding", "voice", "interview", "eligibility_check"].includes(app.status) && <Clock className="w-3.5 h-3.5 mr-1.5" />}
                                            {formatStatus(app.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500 font-mono text-sm py-4 whitespace-nowrap">
                                        {new Date(app.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell className="py-4 max-w-[140px]">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-gray-600 w-8 text-right">{progress}%</span>
                                            <Progress value={progress} className="h-1.5 bg-gray-100 [&>*]:bg-emerald-500" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 py-4">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-emerald-50 hover:text-emerald-600">
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

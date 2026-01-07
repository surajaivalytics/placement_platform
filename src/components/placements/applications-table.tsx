
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const applications = [
    {
        id: 1,
        name: "Sujal",
        company: "TCS",
        role: "System Engineer",
        status: "Selected",
        date: "Dec 28, 2024",
        progress: 100,
    },
    {
        id: 2,
        name: "Rahul Kumar",
        company: "Infosys",
        role: "Power Programmer",
        status: "In Review",
        date: "Dec 30, 2024",
        progress: 60,
    },
    {
        id: 3,
        name: "Ananya Singh",
        company: "Wipro",
        role: "Project Engineer",
        status: "Rejected",
        date: "Dec 25, 2024",
        progress: 20,
    },
    {
        id: 4,
        name: "Vikram Malhotra",
        company: "Accenture",
        role: "App Developer",
        status: "Applied",
        date: "Jan 02, 2025",
        progress: 10,
    },
];

const statusStyles = {
    Selected: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200",
    "In Review": "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",
    Rejected: "bg-red-50 text-red-500 border-red-200 hover:bg-red-100", // Red for rejected
    Applied: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100",
};

export function ApplicationsTable() {
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
                        {applications.map((app) => (
                            <TableRow key={app.id} className="hover:bg-emerald-50/30 transition-colors border-gray-100 group">
                                <TableCell className="font-medium text-gray-900 pl-6 py-4">{app.name}</TableCell>
                                <TableCell className="text-gray-600 py-4">{app.company}</TableCell>
                                <TableCell className="text-gray-600 py-4">{app.role}</TableCell>
                                <TableCell className="py-4">
                                    <Badge variant="outline" className={cn("rounded-md px-3 py-1 font-medium border", statusStyles[app.status as keyof typeof statusStyles])}>
                                        {app.status === "Selected" && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                                        {app.status === "Rejected" && <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                                        {app.status === "In Review" && <Clock className="w-3.5 h-3.5 mr-1.5" />}
                                        {app.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-500 font-mono text-sm py-4">{app.date}</TableCell>
                                <TableCell className="py-4 max-w-[140px]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-gray-600 w-8 text-right">{app.progress}%</span>
                                        <Progress value={app.progress} className="h-1.5 bg-gray-100 [&>*]:bg-emerald-500" />
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-6 py-4">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-emerald-50 hover:text-emerald-600">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

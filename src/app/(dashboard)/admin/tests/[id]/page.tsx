import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, FileEdit, GraduationCap, LayoutDashboard, Settings, Users, Clock, Target } from "lucide-react";
import { TestSettingsForm } from "@/components/admin/test-settings-form";
import { TestStructureEditor } from "@/components/admin/test-structure-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function TestDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const test = await prisma.test.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    questions: true,
                    subtopics: true,
                    results: true, // Assuming relation exists for stats
                }
            }
        }
    });

    if (!test) {
        notFound();
    }

    // Parse eligibility criteria if it exists (it's Json type in Prisma)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eligibilityCriteria = test.eligibilityCriteria as any;

    return (
        <div className="space-y-6 p-6 md:p-4 -mt-10 bg-gray-50/50 min-h-screen">
            {/* Breadcrumb / Back Navigation */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                    <Link href="/admin/mock-tests">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Assessments
                    </Link>
                </Button>
            </div>

            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <BookOpen size={120} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Badge className="px-3 py-1 text-blue-100 bg-white/20 hover:bg-white/30 border-0 backdrop-blur-sm">
                                {test.type === 'company' ? `Company: ${test.company}` : 'Topic Wise'}
                            </Badge>
                            <Badge variant="outline" className={`border-0 backdrop-blur-sm ${test.difficulty === 'Hard' ? 'text-red-100 bg-red-500/30' :
                                    test.difficulty === 'Medium' ? 'text-amber-100 bg-amber-500/30' :
                                        'text-green-100 bg-green-500/30'
                                }`}>
                                {test.difficulty}
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2">{test.title}</h1>
                        <p className="text-blue-100/80 text-lg max-w-2xl leading-relaxed">{test.description || "No description provided."}</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-3">
                        {/* Placeholder for future actions */}
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="shadow-sm border-none bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{test.duration} <span className="text-sm font-normal text-muted-foreground">mins</span></div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-none bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rounds</CardTitle>
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{test._count.subtopics}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-none bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Questions</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{test._count.questions}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-none bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Candidates</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{test._count.results}</div>
                        <p className="text-xs text-muted-foreground">Attempts so far</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs Interface */}
            <Tabs defaultValue="rounds" className="space-y-6">
                <TabsList className="bg-white p-1 border h-12 w-full md:w-auto justify-start rounded-xl">
                    <TabsTrigger value="rounds" className="h-10 px-6 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <LayoutDashboard className="w-4 h-4 mr-2" /> Rounds & Structure
                    </TabsTrigger>
                    <TabsTrigger value="eligibility" className="h-10 px-6 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <GraduationCap className="w-4 h-4 mr-2" /> Eligibility & Settings
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="h-10 px-6 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <Target className="w-4 h-4 mr-2" /> Review Questions
                    </TabsTrigger>
                </TabsList>

                {/* TAB: Rounds Configuration */}
                <TabsContent value="rounds" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                    <div className="grid gap-6">
                        <TestStructureEditor testId={test.id} testTitle={test.title} />
                    </div>
                </TabsContent>

                {/* TAB: Eligibility & Settings */}
                <TabsContent value="eligibility" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                    <div className="grid gap-6 max-w-4xl">
                        <TestSettingsForm testId={test.id} initialCriteria={eligibilityCriteria} />
                    </div>
                </TabsContent>

                {/* TAB: Preview / Legacy Questions Link */}
                <TabsContent value="preview" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Questions Directly</CardTitle>
                            <CardContent className="pl-0 pt-4">
                                <p className="text-muted-foreground mb-4">
                                    You can view and edit all questions in a flat list view here.
                                    For structural changes, use the <strong>Rounds & Structure</strong> tab.
                                </p>
                                <Button asChild variant="outline">
                                    <Link href={`/admin/tests/${test.id}/questions`}>
                                        <FileEdit className="mr-2 h-4 w-4" />
                                        Open Question Manager
                                    </Link>
                                </Button>
                            </CardContent>
                        </CardHeader>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

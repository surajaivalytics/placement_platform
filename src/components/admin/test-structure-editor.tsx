"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, Trash2, BookOpen, AlertCircle, CheckCircle2, ArrowUp, ArrowDown, Pencil, Settings2, FolderPlus, FileText, Layers } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { importQuestionsFromContext } from "@/app/actions/import-questions";

interface Subtopic {
    id: string;
    name: string;
    description?: string;
    totalQuestions: number;
    order: number;
    roundTitle?: string;
    type?: string;
}

interface RoundGroup {
    title: string;
    type: string;
    subtopics: Subtopic[];
    minOrder: number;
}

interface TestStructureEditorProps {
    testId: string;
    testTitle?: string;
}

export function TestStructureEditor({ testId, testTitle }: TestStructureEditorProps) {
    const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog States
    const [isRoundDialogOpen, setIsRoundDialogOpen] = useState(false);
    const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

    // Selection States
    const [selectedRoundTitle, setSelectedRoundTitle] = useState<string | null>(null);
    const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);

    // Form states
    const [roundForm, setRoundForm] = useState({ title: '', type: 'assessment' });
    const [sectionForm, setSectionForm] = useState({ id: '', name: '', description: '', order: 0 });

    // Upload states
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);

    useEffect(() => {
        fetchSubtopics();
    }, [testId]);

    const fetchSubtopics = async () => {
        try {
            const subtopicsResponse = await fetch(`/api/tests/${testId}/subtopics`);
            if (subtopicsResponse.ok) {
                const data = await subtopicsResponse.json();
                const sorted = (data.subtopics || []).sort((a: Subtopic, b: Subtopic) => (a.order || 0) - (b.order || 0));
                setSubtopics(sorted);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error("Failed to load rounds");
        } finally {
            setLoading(false);
        }
    };

    // Grouping Logic
    const groupedRounds: RoundGroup[] = [];
    const groupedMap = new Map<string, Subtopic[]>();

    subtopics.forEach(sub => {
        const title = sub.roundTitle || "Uncategorized"; // Fallback for legacy data
        if (!groupedMap.has(title)) groupedMap.set(title, []);
        groupedMap.get(title)?.push(sub);
    });

    // Convert map to array and sort by the order of the first item in the group
    Array.from(groupedMap.entries()).forEach(([title, subs]) => {
        if (subs.length > 0) {
            groupedRounds.push({
                title,
                type: subs[0].type || 'assessment',
                subtopics: subs,
                minOrder: subs[0].order
            });
        }
    });

    groupedRounds.sort((a, b) => a.minOrder - b.minOrder);

    // --- Actions ---

    // 1. Add/Edit Round
    const openAddRoundDialog = () => {
        setRoundForm({ title: '', type: 'assessment' });
        setSelectedRoundTitle(null);
        setIsRoundDialogOpen(true);
    };

    const handleSaveRound = async () => {
        // Since "Round" isn't a DB entity, creating a round actually involves creating its first section
        // BUT logic simplifies if we separate "Add Round Container" (UI concept) from "Add Subtopic".
        // Here, we'll prompt for "Round Title" AND "First Section Name" if it's new.

        // Actually, simpler: "Add Round" just sets the context for the "Add Section" dialog?
        // No, user expects to see the Round created.

        // Let's create a "Default Section" for the round to make it exist.
        // E.g. Round="Online Assessment", Section="General" (or user input).

        // Wait, "Add Round" just adds a section?
        // Let's make "Add Round" open a dialog that asks for Round Details AND First Section Details.

        if (!roundForm.title) return;

        // If 'Renaming' a round (Not implementing rename logic strictly yet as it requires bulk update)
        // For 'Add New Round', we proceed to create a section.
        setSectionForm({
            id: '',
            name: roundForm.type === 'interview' ? roundForm.title : 'Section 1',
            description: '',
            order: subtopics.length + 1
        });
        setSelectedRoundTitle(roundForm.title);
        setIsRoundDialogOpen(false);
        setIsSectionDialogOpen(true); // Open section dialog to finish creation
    };

    // 2. Add/Edit Section
    const openAddSectionDialog = (roundTitle: string) => {
        setSelectedRoundTitle(roundTitle);
        // Find type from existing groups
        const group = groupedRounds.find(g => g.title === roundTitle);
        setRoundForm({ title: roundTitle, type: group?.type || 'assessment' });

        setSectionForm({
            id: '',
            name: '',
            description: '',
            order: subtopics.length + 1
        });
        setIsSectionDialogOpen(true);
    };

    const openEditSectionDialog = (sub: Subtopic) => {
        setSelectedSubtopic(sub);
        setSelectedRoundTitle(sub.roundTitle || 'Uncategorized');
        setRoundForm({ title: sub.roundTitle || 'Uncategorized', type: sub.type || 'assessment' });
        setSectionForm({
            id: sub.id,
            name: sub.name,
            description: sub.description || '',
            order: sub.order
        });
        setIsSectionDialogOpen(true);
    };

    const handleSaveSection = async () => {
        try {
            const isEdit = !!sectionForm.id;
            const url = isEdit
                ? `/api/tests/${testId}/subtopics/${sectionForm.id}`
                : `/api/tests/${testId}/subtopics`;

            const method = isEdit ? 'PUT' : 'POST';

            const payload = {
                name: sectionForm.name,
                description: sectionForm.description,
                order: sectionForm.order,
                roundTitle: selectedRoundTitle || roundForm.title,
                type: roundForm.type
            };

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setIsSectionDialogOpen(false);
                toast.success(isEdit ? "Section updated" : "Section created");
                fetchSubtopics();
            } else {
                toast.error("Failed to save section");
            }
        } catch (error) {
            toast.error("Error saving section");
        }
    };

    const handleDeleteSection = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}" and all its questions?`)) return;
        try {
            await fetch(`/api/tests/${testId}/subtopics/${id}`, { method: 'DELETE' });
            toast.success("Deleted");
            fetchSubtopics();
        } catch (e) { toast.error("Failed to delete"); }
    };

    // Reordering Helper
    const updateOrder = async (newOrderList: Subtopic[]) => {
        // Optimistic
        setSubtopics(newOrderList);
        try {
            await fetch(`/api/tests/${testId}/subtopics/reorder`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subtopics: newOrderList.map(s => ({ id: s.id, order: s.order }))
                })
            });
            toast.success("Order updated");
        } catch (error) {
            toast.error("Failed to save order");
            fetchSubtopics();
        }
    };

    const moveRound = (index: number, direction: 'up' | 'down') => {
        // Swap entire groups of subtopics?
        // Easier: Just swap the distinct 'Round Groups'. 
        // 1. Get all subtopics.
        // 2. Identify the two groups to swap.
        // 3. Re-assign 'order' values globally based on the new Group Sequence.

        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === groupedRounds.length - 1) return;

        const newGroups = [...groupedRounds];
        const swapIdx = direction === 'up' ? index - 1 : index + 1;

        // Swap
        [newGroups[index], newGroups[swapIdx]] = [newGroups[swapIdx], newGroups[index]];

        // Re-calculate all subtopic orders
        const reorderedSubtopics: Subtopic[] = [];
        let runningOrder = 1;

        newGroups.forEach(group => {
            group.subtopics.forEach(sub => {
                reorderedSubtopics.push({ ...sub, order: runningOrder++ });
            });
        });

        updateOrder(reorderedSubtopics);
    };

    const moveSection = (roundTitle: string, indexInGroup: number, direction: 'up' | 'down') => {
        const group = groupedRounds.find(g => g.title === roundTitle);
        if (!group) return;

        if (direction === 'up' && indexInGroup === 0) return;
        if (direction === 'down' && indexInGroup === group.subtopics.length - 1) return;

        const subs = [...group.subtopics];
        const swapIdx = direction === 'up' ? indexInGroup - 1 : indexInGroup + 1;

        [subs[indexInGroup], subs[swapIdx]] = [subs[swapIdx], subs[indexInGroup]];

        // Merge back into full list
        const otherSubtopics = subtopics.filter(s => s.roundTitle !== roundTitle);
        const finalList = [...otherSubtopics, ...subs].sort((a, b) => {
            // We need to maintain the visual order of Rounds, so we can't just simple sort.
            // But simpler: just swap the orders of the two subtopics involved?
            // Yes, they are adjacent in the group, and thus adjacent in global list?
            // Not necessarily.

            // Safer: Re-construct entire list based on Group Order + Section Order
            return 0; // Handled below
        });

        // Actually, just Update groups logic again:
        // Identify "Current Group Index"
        // flatten groups

        // Let's duplicate logic for simplicity and robustness
        const newGroups = groupedRounds.map(g => {
            if (g.title === roundTitle) return { ...g, subtopics: subs };
            return g;
        });

        const reorderedAll: Subtopic[] = [];
        let order = 1;
        newGroups.forEach(g => {
            g.subtopics.forEach(s => {
                reorderedAll.push({ ...s, order: order++ });
            });
        });

        updateOrder(reorderedAll);
    };

    // Upload Logic
    const handleSmartUpload = async () => {
        if (!uploadFile || !selectedSubtopic) {
            toast.error("Please select a file and round");
            return;
        }

        setUploading(true);
        setUploadResult(null);

        try {
            const formData = new FormData();
            formData.append("file", uploadFile);

            // 1. Analyze File
            const result = await importQuestionsFromContext(formData);

            if (result.error) {
                toast.error(result.error);
                setUploadResult({ error: result.error });
                return;
            }

            if (!result.questions || result.questions.length === 0) {
                toast.error("No questions found in file.");
                setUploadResult({ error: "No questions found." });
                return;
            }

            // 2. Save to Subtopic
            // We need an API endpoint on the subtopic to validly save these questions.
            // Existing endpoint from legacy upload might be specific to CSV?
            // Checking: /api/admin/subtopics/upload might be usable if updated or we use a general bulk route.
            // Let's assume we need to POST to /api/tests/{testId}/subtopics/{subtopicId}/questions
            // Or reuse the existing /api/admin/subtopics/upload but with JSON body?
            // Actually, let's keep it simple and POST to the subtopic questions route.

            // Wait, checking the file structure, maybe there is no dedicated subtopic questions route yet?
            // The file uses `/api/admin/subtopics/upload` which took formData.
            // Let's modify that to simply take the PARSED list if we want to follow the "Smart Import" pattern 
            // OR checks if the backend `admin/subtopics/upload` can be updated.
            // Since I cannot easily verify the backend `admin/subtopics/upload` right now without checking another file,
            // I will implement the client-side parsing here and send the JSON to a new/updated endpoint.

            // Let's send to: /api/tests/${testId}/subtopics/${selectedSubtopic.id}/questions/bulk
            // Or just reuse existing `questions/bulk` logic? 
            // Probably safer to stick to the pattern I just made for the main test:
            // But this is for a SUBTOPIC. 
            // Let's look at the implementation of `handleUploadCSV` again. It posted to `/api/admin/subtopics/upload`.
            // I should probably update THAT route to handle the smart logic? 
            // OR just parse here and send JSON. Sending JSON is cleaner as I have the parser client-side (via server action).

            const response = await fetch(`/api/tests/${testId}/subtopics/${selectedSubtopic.id}/questions/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questions: result.questions })
            });

            const saveResult = await response.json();

            if (response.ok) {
                toast.success(`Successfully added ${result.questions.length} questions.`);
                setUploadResult({ created: result.questions.length });
                fetchSubtopics();
                setTimeout(() => {
                    setIsUploadDialogOpen(false);
                    setUploadFile(null);
                    setSelectedSubtopic(null);
                    setUploadResult(null);
                }, 2000);
            } else {
                setUploadResult({ error: saveResult.error || "Failed to save questions" });
                toast.error(saveResult.error || "Failed to save");
            }

        } catch (error) {
            console.error('Upload error:', error);
            setUploadResult({ error: 'Failed to process file' });
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-muted-foreground animate-pulse">Loading test structure...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
                        <Layers className="w-6 h-6 text-blue-600" />
                        Test Rounds & Structure
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Organize your mock test into Rounds (e.g., Assessment, Interview) and Sections.</p>
                </div>
                <Button
                    onClick={openAddRoundDialog}
                    className="bg-[#181C2E] text-white hover:bg-gray-800 shadow-md transition-all"
                >
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Add New Round
                </Button>
            </div>

            <div className="space-y-6">
                {groupedRounds.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center bg-gray-50/50">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
                            <Layers className="w-8 h-8 text-gray-300" />
                        </div>
                        <h4 className="font-semibold text-gray-900 text-lg">Empty Structure</h4>
                        <p className="text-gray-500 max-w-sm mx-auto mt-2">Start by adding your first round, like "Online Assessment" or "Technical Interview".</p>
                        <Button variant="outline" onClick={openAddRoundDialog} className="mt-6">
                            Create First Round
                        </Button>
                    </div>
                ) : (
                    groupedRounds.map((group, groupIndex) => (
                        <Card key={group.title + groupIndex} className="border-t-4 border-t-blue-500 shadow-sm overflow-hidden">
                            <CardHeader className="bg-gray-50/50 pb-3 pt-4 flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="bg-white border-gray-200 text-gray-500 font-mono">
                                        Round {groupIndex + 1}
                                    </Badge>
                                    <div>
                                        <CardTitle className="text-lg font-bold text-gray-800">{group.title}</CardTitle>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">{group.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col mr-2">
                                        <Button
                                            variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-blue-600"
                                            disabled={groupIndex === 0}
                                            onClick={() => moveRound(groupIndex, 'up')}
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-blue-600"
                                            disabled={groupIndex === groupedRounds.length - 1}
                                            onClick={() => moveRound(groupIndex, 'down')}
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => openAddSectionDialog(group.title)}>
                                        <Plus className="w-4 h-4 mr-1.5" />
                                        Add Section
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-100">
                                    {group.subtopics.map((sub, subIndex) => (
                                        <div key={sub.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-center justify-center w-8 text-gray-300">
                                                    <Button
                                                        variant="ghost" size="icon" className="h-5 w-5 hover:text-blue-600 p-0"
                                                        disabled={subIndex === 0}
                                                        onClick={() => moveSection(group.title, subIndex, 'up')}
                                                    >
                                                        <ArrowUp className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon" className="h-5 w-5 hover:text-blue-600 p-0"
                                                        disabled={subIndex === group.subtopics.length - 1}
                                                        onClick={() => moveSection(group.title, subIndex, 'down')}
                                                    >
                                                        <ArrowDown className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h5 className="font-medium text-gray-900">{sub.name}</h5>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                        {sub.type !== 'interview' && (
                                                            <span className="flex items-center gap-1">
                                                                <BookOpen className="w-3 h-3" />
                                                                {sub.totalQuestions} Questions
                                                            </span>
                                                        )}
                                                        {sub.description && (
                                                            <span className="truncate max-w-[200px] hidden sm:inline" title={sub.description}>• {sub.description}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" onClick={() => openEditSectionDialog(sub)}>
                                                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                                                </Button>
                                                {sub.type !== 'interview' && (
                                                    <Button variant="ghost" size="sm"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => { setSelectedSubtopic(sub); setIsUploadDialogOpen(true); }}
                                                    >
                                                        <Upload className="w-3.5 h-3.5 mr-1" /> Questions
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon"
                                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDeleteSection(sub.id, sub.name)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Dialogs */}

            {/* 1. Add Round Dialog */}
            <Dialog open={isRoundDialogOpen} onOpenChange={setIsRoundDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Round</DialogTitle>
                        <DialogDescription>Define a major stage in your mock test (e.g., Online Assessment, Technical Interview).</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Round Title</Label>
                            <Input
                                placeholder="E.g., Online Assessment"
                                value={roundForm.title}
                                onChange={(e) => setRoundForm({ ...roundForm, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Round Type</Label>
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={roundForm.type}
                                onChange={(e) => setRoundForm({ ...roundForm, type: e.target.value })}
                            >
                                <option value="assessment">Assessment (MCQ)</option>
                                <option value="coding">Coding</option>
                                <option value="interview">Interview</option>
                                <option value="essay">Essay / Writing</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRoundDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveRound} disabled={!roundForm.title}>Next: Add Section</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 2. Add/Edit Section Dialog */}
            <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{sectionForm.id ? "Edit Section" : `Add Section to ${selectedRoundTitle}`}</DialogTitle>
                        <DialogDescription>
                            Configure the specific topic or module (e.g., Quants, Java Coding).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Section Name</Label>
                            <Input
                                placeholder="E.g., Quantitative Aptitude"
                                value={sectionForm.name}
                                onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Instructions or details..."
                                value={sectionForm.description}
                                onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSectionDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveSection} disabled={!sectionForm.name}>Save Section</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Upload Dialog */}
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Questions</DialogTitle>
                        <DialogDescription>
                            Import questions for <b>{selectedSubtopic?.name}</b>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select File</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 border-gray-300">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <Input
                                    type="file"
                                    accept=".csv,.xlsx,.xls,.json,.pdf"
                                    className="hidden"
                                    id="smart-upload-file"
                                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                />
                                <Label htmlFor="smart-upload-file" className="cursor-pointer text-blue-600 font-medium hover:underline">
                                    {uploadFile ? uploadFile.name : "Choose File"}
                                </Label>
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    Supports CSV, Excel, JSON, PDF (AI).<br />
                                    Auto-detects MCQ and Coding formats.
                                </p>
                            </div>
                        </div>

                        {uploadResult && (
                            <div className={`p-4 rounded-md text-sm ${uploadResult.error ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                                {uploadResult.error ? (
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {uploadResult.error}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Successfully imported {uploadResult.created} questions.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Close</Button>
                        <Button onClick={handleSmartUpload} disabled={!uploadFile || uploading} className="min-w-[120px]">
                            {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : "Import Questions"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div >
    );
}

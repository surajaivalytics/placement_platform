"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { Spinner } from "@/components/ui/loader";
import { toast } from "sonner";

interface TestSettingsFormProps {
    testId: string;
    initialCriteria?: {
        tenthPercentage?: number;
        twelfthPercentage?: number;
        graduationCGPA?: number;
        backlogs?: number;
    } | null;
}

export function TestSettingsForm({ testId, initialCriteria }: TestSettingsFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tenthPercentage: initialCriteria?.tenthPercentage?.toString() || "60",
        twelfthPercentage: initialCriteria?.twelfthPercentage?.toString() || "60",
        graduationCGPA: initialCriteria?.graduationCGPA?.toString() || "6.0",
        backlogs: initialCriteria?.backlogs?.toString() || "0",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const criteria = {
                tenthPercentage: parseFloat(formData.tenthPercentage),
                twelfthPercentage: parseFloat(formData.twelfthPercentage),
                graduationCGPA: parseFloat(formData.graduationCGPA),
                backlogs: parseInt(formData.backlogs),
            };

            const response = await fetch(`/api/tests/${testId}/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eligibilityCriteria: criteria }),
            });

            if (!response.ok) {
                throw new Error("Failed to update settings");
            }

            toast.success("Eligibility criteria updated successfully");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save changes");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Eligibility Criteria</CardTitle>
                <CardDescription>
                    Set the minimum academic requirements for students to attempt this test.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tenthPercentage">Min. 10th Percentage</Label>
                            <Input
                                id="tenthPercentage"
                                name="tenthPercentage"
                                type="number"
                                step="0.1"
                                value={formData.tenthPercentage}
                                onChange={handleChange}
                                placeholder="60.0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="twelfthPercentage">Min. 12th Percentage</Label>
                            <Input
                                id="twelfthPercentage"
                                name="twelfthPercentage"
                                type="number"
                                step="0.1"
                                value={formData.twelfthPercentage}
                                onChange={handleChange}
                                placeholder="60.0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="graduationCGPA">Min. Graduation CGPA</Label>
                            <Input
                                id="graduationCGPA"
                                name="graduationCGPA"
                                type="number"
                                step="0.1"
                                value={formData.graduationCGPA}
                                onChange={handleChange}
                                placeholder="6.0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="backlogs">Max. Active Backlogs</Label>
                            <Input
                                id="backlogs"
                                name="backlogs"
                                type="number"
                                value={formData.backlogs}
                                onChange={handleChange}
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading && <Spinner size={16} className="mr-2" />}
                            {loading ? "Saving..." : "Save Criteria"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

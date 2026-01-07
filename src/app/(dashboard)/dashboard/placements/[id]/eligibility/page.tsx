"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface EligibilityData {
  tenthPercentage: string;
  twelfthPercentage: string;
  graduationCGPA: string;
  backlogs: string;
  gapYears: string;
  gapDuringGrad: boolean;
}

export default function EligibilityPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [company, setCompany] = useState("");
  const [formData, setFormData] = useState<EligibilityData>({
    tenthPercentage: "",
    twelfthPercentage: "",
    graduationCGPA: "",
    backlogs: "0",
    gapYears: "0",
    gapDuringGrad: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EligibilityData, string>>>({});

  const fetchApplication = useCallback(async () => {
    try {
      const response = await fetch(`/api/placements/${applicationId}`);
      if (response.ok) {
        const data = await response.json();
        setCompany(data.company);
        
        // Pre-fill if user has academic data
        if (data.user) {
          setFormData({
            tenthPercentage: data.user.tenthPercentage?.toString() || "",
            twelfthPercentage: data.user.twelfthPercentage?.toString() || "",
            graduationCGPA: data.user.graduationCGPA?.toString() || "",
            backlogs: data.user.backlogs?.toString() || "0",
            gapYears: data.user.gapYears?.toString() || "0",
            gapDuringGrad: data.user.gapDuringGrad || false,
          });
        }
      } else {
        alert("Application not found");
        router.push("/dashboard/placements");
      }
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setLoading(false);
    }
  }, [applicationId, router]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EligibilityData, string>> = {};

    const tenth = parseFloat(formData.tenthPercentage);
    const twelfth = parseFloat(formData.twelfthPercentage);
    const grad = parseFloat(formData.graduationCGPA);
    const backlogs = parseInt(formData.backlogs);
    const gaps = parseInt(formData.gapYears);

    if (isNaN(tenth) || tenth < 0 || tenth > 100) {
      newErrors.tenthPercentage = "Please enter a valid percentage (0-100)";
    }
    if (isNaN(twelfth) || twelfth < 0 || twelfth > 100) {
      newErrors.twelfthPercentage = "Please enter a valid percentage (0-100)";
    }
    if (isNaN(grad) || grad < 0 || grad > 10) {
      newErrors.graduationCGPA = "Please enter a valid CGPA (0-10)";
    }
    if (isNaN(backlogs) || backlogs < 0) {
      newErrors.backlogs = "Please enter a valid number";
    }
    if (isNaN(gaps) || gaps < 0) {
      newErrors.gapYears = "Please enter a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/placements/${applicationId}/eligibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenthPercentage: parseFloat(formData.tenthPercentage),
          twelfthPercentage: parseFloat(formData.twelfthPercentage),
          graduationCGPA: parseFloat(formData.graduationCGPA),
          backlogs: parseInt(formData.backlogs),
          gapYears: parseInt(formData.gapYears),
          gapDuringGrad: formData.gapDuringGrad,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to result page
        router.push(`/dashboard/placements/${applicationId}/eligibility-result`);
      } else {
        alert(data.error || "Failed to submit eligibility check");
      }
    } catch (error) {
      console.error("Error submitting eligibility:", error);
      alert("Failed to submit eligibility check");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof EligibilityData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getEligibilityCriteria = () => {
    if (company === "TCS") {
      return [
        "≥60% in 10th, 12th & Graduation (6.0 CGPA)",
        "≤1 Active Backlog",
        "≤24 months gap in education",
      ];
    } else {
      return [
        "≥60% in 10th, 12th & Graduation (6.0 CGPA)",
        "≤1 Active Backlog",
        "≤3 years gap before graduation",
        "No gap during graduation",
      ];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Eligibility Check - {company}</h1>
        <p className="text-muted-foreground">
          Please provide your academic details to check eligibility
        </p>
      </div>

      {/* Eligibility Criteria */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="font-semibold mb-2">Eligibility Criteria:</div>
          <ul className="space-y-1 text-sm">
            {getEligibilityCriteria().map((criteria, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {criteria}
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Details</CardTitle>
          <CardDescription>All fields are required</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* 10th Percentage */}
              <div className="space-y-2">
                <Label htmlFor="tenth">10th Percentage *</Label>
                <Input
                  id="tenth"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.tenthPercentage}
                  onChange={(e) => handleChange("tenthPercentage", e.target.value)}
                  placeholder="85.5"
                  required
                />
                {errors.tenthPercentage && (
                  <p className="text-sm text-destructive">{errors.tenthPercentage}</p>
                )}
              </div>

              {/* 12th Percentage */}
              <div className="space-y-2">
                <Label htmlFor="twelfth">12th Percentage *</Label>
                <Input
                  id="twelfth"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.twelfthPercentage}
                  onChange={(e) => handleChange("twelfthPercentage", e.target.value)}
                  placeholder="82.0"
                  required
                />
                {errors.twelfthPercentage && (
                  <p className="text-sm text-destructive">{errors.twelfthPercentage}</p>
                )}
              </div>

              {/* Graduation CGPA */}
              <div className="space-y-2">
                <Label htmlFor="cgpa">Graduation CGPA (out of 10) *</Label>
                <Input
                  id="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.graduationCGPA}
                  onChange={(e) => handleChange("graduationCGPA", e.target.value)}
                  placeholder="7.5"
                  required
                />
                {errors.graduationCGPA && (
                  <p className="text-sm text-destructive">{errors.graduationCGPA}</p>
                )}
              </div>

              {/* Backlogs */}
              <div className="space-y-2">
                <Label htmlFor="backlogs">Active Backlogs *</Label>
                <Input
                  id="backlogs"
                  type="number"
                  min="0"
                  value={formData.backlogs}
                  onChange={(e) => handleChange("backlogs", e.target.value)}
                  placeholder="0"
                  required
                />
                {errors.backlogs && (
                  <p className="text-sm text-destructive">{errors.backlogs}</p>
                )}
              </div>

              {/* Gap Years */}
              <div className="space-y-2">
                <Label htmlFor="gaps">Gap Years in Education *</Label>
                <Input
                  id="gaps"
                  type="number"
                  min="0"
                  value={formData.gapYears}
                  onChange={(e) => handleChange("gapYears", e.target.value)}
                  placeholder="0"
                  required
                />
                {errors.gapYears && (
                  <p className="text-sm text-destructive">{errors.gapYears}</p>
                )}
              </div>
            </div>

            {/* Gap During Graduation */}
            {company === "Wipro" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gapDuringGrad"
                  checked={formData.gapDuringGrad}
                  onCheckedChange={(checked) => handleChange("gapDuringGrad", checked as boolean)}
                />
                <Label
                  htmlFor="gapDuringGrad"
                  className="text-sm font-normal cursor-pointer"
                >
                  I have a gap during my graduation
                </Label>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/placements")}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking Eligibility...
                  </>
                ) : (
                  "Check Eligibility"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

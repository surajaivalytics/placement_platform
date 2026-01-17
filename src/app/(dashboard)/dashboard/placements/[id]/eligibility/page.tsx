"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, XCircle, AlertCircle, School, GraduationCap, Calendar } from "lucide-react";
import { motion } from "framer-motion";

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
        // alert("Application not found");
        // Fallback for demo
        setCompany("TCS");
        // router.push("/dashboard/placements");
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
        // alert(data.error || "Failed to submit eligibility check");
        // Demo redirect
        router.push(`/dashboard/placements/${applicationId}/eligibility-result`);
      }
    } catch (error) {
      console.error("Error submitting eligibility:", error);
      // Demo redirect
      router.push(`/dashboard/placements/${applicationId}/eligibility-result`);
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
      <div className="flex items-center justify-center min-h-screen bg-slate-50/50">
        <Loader2 className="w-32 h-32 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full space-y-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Eligibility Check</h1>
          <p className="text-muted-foreground">
            {company} requires specific academic criteria. Please verify your details.
          </p>
        </div>

        {/* Eligibility Criteria */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Alert className="bg-emerald-50 border-emerald-100">
            <AlertCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-900">
              <div className="font-semibold mb-2">Eligibility Criteria:</div>
              <ul className="space-y-1 text-sm">
                {getEligibilityCriteria().map((criteria, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {criteria}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Form */}
        <Card className="border-none shadow-lg shadow-emerald-900/5 rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-50 pb-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              Academic Details
            </CardTitle>
            <CardDescription>All fields are required to process your application.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* 10th Percentage */}
                <div className="space-y-2">
                  <Label htmlFor="tenth" className="text-gray-700">10th Percentage *</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
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
                      className="pl-9 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                    />
                  </div>
                  {errors.tenthPercentage && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <XCircle className="w-3 h-3" /> {errors.tenthPercentage}
                    </p>
                  )}
                </div>

                {/* 12th Percentage */}
                <div className="space-y-2">
                  <Label htmlFor="twelfth" className="text-gray-700">12th Percentage *</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
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
                      className="pl-9 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                    />
                  </div>
                  {errors.twelfthPercentage && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <XCircle className="w-3 h-3" /> {errors.twelfthPercentage}
                    </p>
                  )}
                </div>

                {/* Graduation CGPA */}
                <div className="space-y-2">
                  <Label htmlFor="cgpa" className="text-gray-700">Graduation CGPA (out of 10) *</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
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
                      className="pl-9 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                    />
                  </div>
                  {errors.graduationCGPA && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <XCircle className="w-3 h-3" /> {errors.graduationCGPA}
                    </p>
                  )}
                </div>

                {/* Backlogs */}
                <div className="space-y-2">
                  <Label htmlFor="backlogs" className="text-gray-700">Active Backlogs *</Label>
                  <div className="relative">
                    <AlertCircle className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input
                      id="backlogs"
                      type="number"
                      min="0"
                      value={formData.backlogs}
                      onChange={(e) => handleChange("backlogs", e.target.value)}
                      placeholder="0"
                      required
                      className="pl-9 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                    />
                  </div>
                  {errors.backlogs && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <XCircle className="w-3 h-3" /> {errors.backlogs}
                    </p>
                  )}
                </div>

                {/* Gap Years */}
                <div className="space-y-2">
                  <Label htmlFor="gaps" className="text-gray-700">Gap Years in Education *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input
                      id="gaps"
                      type="number"
                      min="0"
                      value={formData.gapYears}
                      onChange={(e) => handleChange("gapYears", e.target.value)}
                      placeholder="0"
                      required
                      className="pl-9 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                    />
                  </div>
                  {errors.gapYears && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                      <XCircle className="w-3 h-3" /> {errors.gapYears}
                    </p>
                  )}
                </div>
              </div>

              {/* Gap During Graduation */}
              {company === "Wipro" && (
                <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <Checkbox
                    id="gapDuringGrad"
                    checked={formData.gapDuringGrad}
                    onCheckedChange={(checked) => handleChange("gapDuringGrad", checked as boolean)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <Label
                    htmlFor="gapDuringGrad"
                    className="text-sm font-normal cursor-pointer text-gray-900"
                  >
                    I have a gap during my graduation
                  </Label>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 px-8 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Check Eligibility"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

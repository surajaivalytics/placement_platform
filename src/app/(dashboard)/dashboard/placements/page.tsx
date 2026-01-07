"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowRight, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";

interface Application {
  id: string;
  company: string;
  status: string;
  currentStage: string | null;
  finalTrack: string | null;
  finalDecision: string | null;
  createdAt: string;
}

export default function PlacementsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await fetch("/api/placements/my-applications");
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApply = async (company: string) => {
    try {
      const response = await fetch("/api/placements/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/placements/${data.id}/eligibility`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to start application");
      }
    } catch (error) {
      console.error("Error starting application:", error);
      alert("Failed to start application");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      eligibility_check: { label: "Eligibility Check", variant: "secondary" },
      foundation: { label: "Foundation Test", variant: "default" },
      advanced: { label: "Advanced Test", variant: "default" },
      coding: { label: "Coding Test", variant: "default" },
      aptitude: { label: "Aptitude Test", variant: "default" },
      essay: { label: "Essay Writing", variant: "default" },
      voice: { label: "Voice Assessment", variant: "default" },
      interview: { label: "Interview", variant: "default" },
      completed: { label: "Completed", variant: "default" },
      rejected: { label: "Rejected", variant: "destructive" },
      withdrawn: { label: "Withdrawn", variant: "outline" },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const companies = [
    {
      name: "TCS",
      fullName: "Tata Consultancy Services",
      description: "India&apos;s largest IT services company with global presence",
      process: [
        "Eligibility Check",
        "Foundation Test (75 mins)",
        "Advanced Test (115 mins)",
        "Track Assignment (Digital/Ninja)",
        "Interview",
      ],
      eligibility: [
        "≥60% in 10th, 12th & Graduation",
        "≤1 Active Backlog",
        "≤24 months gap",
      ],
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Wipro",
      fullName: "Wipro Limited",
      description: "Leading global information technology company",
      process: [
        "Eligibility Check",
        "Aptitude Test (48 mins)",
        "Essay Writing (20 mins)",
        "Coding Test (60 mins)",
        "Voice Assessment",
        "Track Assignment (Turbo/Elite)",
        "Interview",
      ],
      eligibility: [
        "≥60% in 10th, 12th & Graduation",
        "≤1 Active Backlog",
        "≤3 years pre-graduation gap",
        "No gap during graduation",
      ],
      color: "from-purple-500 to-purple-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Campus Placements</h1>
        <p className="text-muted-foreground">
          Apply for campus placement drives and track your application progress
        </p>
      </div>

      {/* My Applications */}
      {applications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">My Applications</h2>
          <div className="grid gap-4">
            {applications.map((app) => (
              <Card key={app.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${app.company === "TCS" ? "from-blue-500 to-blue-600" : "from-purple-500 to-purple-600"} flex items-center justify-center text-white font-bold text-lg`}>
                        {app.company[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{app.company}</h3>
                        <p className="text-sm text-muted-foreground">
                          Applied on {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(app.status)}
                      {app.finalTrack && (
                        <Badge variant="outline" className="font-semibold">
                          {app.finalTrack}
                        </Badge>
                      )}
                      {app.status !== "rejected" && app.status !== "withdrawn" && app.status !== "completed" && (
                        <Button
                          onClick={() => router.push(`/dashboard/placements/${app.id}`)}
                        >
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Companies */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Available Companies</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {companies.map((company) => {
            const hasActiveApplication = applications.some(
              (app) => app.company === company.name && !["rejected", "withdrawn", "completed"].includes(app.status)
            );

            return (
              <Card key={company.name} className="hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${company.color} flex items-center justify-center text-white shadow-lg`}>
                        <Building2 className="w-7 h-7" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{company.fullName}</CardTitle>
                        <CardDescription className="mt-1">{company.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Eligibility Criteria */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Eligibility Criteria
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {company.eligibility.map((criteria, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Selection Process */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Selection Process
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {company.process.map((step, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {idx + 1}. {step}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handleApply(company.name)}
                    disabled={hasActiveApplication}
                  >
                    {hasActiveApplication ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Application In Progress
                      </>
                    ) : (
                      <>
                        Apply Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

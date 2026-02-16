"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/loader";

interface Application {
  id: string;
  company: string;
  status: string;
  eligibilityStatus: string | null;
  eligibilityCheck: {
    isEligible: boolean;
    rejectionReasons: string | null;
  } | null;
}

export default function EligibilityResultPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/placements/${applicationId}`);
      if (response.ok) {
        const data = await response.json();
        setApplication(data);
      } else {
        alert("Application not found");
        router.push("/dashboard/placements");
      }
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!application) return;

    // Redirect to next stage based on company
    if (application.company === "TCS") {
      router.push(`/dashboard/placements/${applicationId}/foundation`);
    } else {
      router.push(`/dashboard/placements/${applicationId}/aptitude`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size={32} className="text-primary" />
      </div>
    );
  }

  if (!application || !application.eligibilityCheck) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Eligibility check not found. Please complete the eligibility form first.
          </AlertDescription>
        </Alert>
        <Button
          className="mt-4"
          onClick={() => router.push(`/dashboard/placements/${applicationId}/eligibility`)}
        >
          Go to Eligibility Form
        </Button>
      </div>
    );
  }

  const isEligible = application.eligibilityCheck.isEligible;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Eligibility Result - {application.company}</h1>
        <p className="text-muted-foreground">
          Your eligibility check has been completed
        </p>
      </div>

      <Card className={`border-2 ${isEligible ? "border-green-500" : "border-red-500"}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {isEligible ? (
              <>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <div className="text-2xl text-green-600 dark:text-green-500">Congratulations!</div>
                  <div className="text-sm font-normal text-muted-foreground">You are eligible to proceed</div>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
                </div>
                <div>
                  <div className="text-2xl text-red-600 dark:text-red-500">Not Eligible</div>
                  <div className="text-sm font-normal text-muted-foreground">Unfortunately, you don&apos;t meet the criteria</div>
                </div>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEligible ? (
            <>
              <Alert className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  You have successfully passed the eligibility check and can proceed to the next stage of the placement process.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="font-semibold">Next Steps:</h3>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  {application.company === "TCS" ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <span>Foundation Test (75 minutes)</span>
                      </div>
                      <div className="ml-8 text-sm text-muted-foreground">
                        • Numerical Ability (20 questions)
                        <br />
                        • Verbal Ability (25 questions)
                        <br />
                        • Reasoning Ability (20 questions)
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <span>Aptitude Test (48 minutes)</span>
                      </div>
                      <div className="ml-8 text-sm text-muted-foreground">
                        • Quantitative Aptitude (16 questions)
                        <br />
                        • Logical Reasoning (14 questions)
                        <br />
                        • Verbal Ability (18 questions)
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Button onClick={handleContinue} className="w-full" size="lg">
                Proceed to {application.company === "TCS" ? "Foundation" : "Aptitude"} Test
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Rejection Reasons:</div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {application.eligibilityCheck.rejectionReasons?.split("; ").map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">What&apos;s Next?</h3>
                <p className="text-sm text-muted-foreground">
                  We encourage you to improve your academic performance and apply again in the future.
                  You can explore other opportunities available on our platform.
                </p>
              </div>

              <Button
                onClick={() => router.push("/dashboard/placements")}
                variant="outline"
                className="w-full"
              >
                Back to Placements
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

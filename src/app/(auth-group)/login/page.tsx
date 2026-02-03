
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner"; // Assuming sonner is used, or alerts

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const headers = new Headers();
    const from = searchParams.get('from') || '/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                // Show error
                console.error("Login failed:", result.error);
                toast.error("Invalid email or password. Please try again.");
            } else if (result?.ok) {
                // Fetch session to check role
                const response = await fetch("/api/auth/session");
                const session = await response.json();

                toast.success("Login successful!");

                if (session?.user?.role === 'admin') {
                    router.push('/admin');
                } else {
                    router.push(from);
                }
                router.refresh();
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[480px] mx-auto w-full space-y-8 animate-in fade-in slide-in-from-right-10 duration-500">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Welcome Back!</h1>
                <p className="text-gray-500 font-medium">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address</label>
                        <Input
                            type="email"
                            placeholder="name@company.com"
                            className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Password</label>
                            <Link href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Forgot password?</Link>
                        </div>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-12"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox id="remember" className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-md" />
                        <label htmlFor="remember" className="text-sm font-medium text-gray-600 cursor-pointer">
                            Remember me for 30 days
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                    </Button>

                    <div className="flex items-center gap-4 py-2">
                        <div className="h-px bg-gray-100 flex-1" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">or</span>
                        <div className="h-px bg-gray-100 flex-1" />
                    </div>

                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => signIn('google', { callbackUrl: from })}
                        className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 font-bold text-gray-700 flex items-center justify-center gap-3 transition-all"
                    >
                        <img src="https://www.vectorlogo.zone/logos/google/google-icon.svg" className="w-5 h-5" alt="Google" />
                        Sign in with Google
                    </Button>
                </div>

                <div className="text-center text-sm text-gray-600">
                    Don't have an account? <Link href="/signup" className="text-blue-600 font-bold hover:underline">Create Account</Link>
                </div>
            </form>
        </div>
    );
}

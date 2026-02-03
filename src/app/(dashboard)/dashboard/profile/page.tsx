"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Copy, Upload, CreditCard, Bell, Lock, User, Camera, Loader2, Save, CheckCircle, Smartphone, Mail, GraduationCap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSearchParams, useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSession } from "next-auth/react";

interface UserProfile {
  name: string;
  email: string;
  image: string | null;
  coverImage: string | null;
  phone: string;
  accountType: string;
  role: string;
  autoPayout: boolean;
  graduationCGPA: number | null;
  tenthPercentage: number | null;
  twelfthPercentage: number | null;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [user, setUser] = useState<UserProfile>({
    name: '',
    email: '',
    image: null,
    coverImage: null,
    phone: '',
    accountType: 'Regular',
    role: 'user',
    autoPayout: false,
    graduationCGPA: null,
    tenthPercentage: null,
    twelfthPercentage: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const isIncomplete = searchParams.get('incomplete') === 'true';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setUser({
          ...data,
          name: data.name || session?.user?.name || '',
          email: data.email || session?.user?.email || '',
          image: data.image || session?.user?.image || '',
          phone: data.phone || '',
          accountType: data.accountType || 'Regular',
          role: data.role || 'user',
          autoPayout: data.autoPayout || false,
          coverImage: data.coverImage || '/images/default-cover.png',
          graduationCGPA: data.graduationCGPA ?? null,
          tenthPercentage: data.tenthPercentage ?? null,
          twelfthPercentage: data.twelfthPercentage ?? null,
        });
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!user.phone || !user.graduationCGPA || !user.tenthPercentage || !user.twelfthPercentage) {
      toast.error("Please fill in all required fields (Phone, Grades)!");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (res.ok) {
        toast.success("Profile updated successfully");
        if (isIncomplete) {
          window.location.href = '/dashboard'; // Force full reload to update session/middleware
        }
      } else {
        throw new Error("Failed update");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading("Uploading image...");

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, [field]: data.url }));
        toast.success("Image uploaded", { id: toastId });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast.error("Upload failed", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-8 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Personal Info</h3>
              <p className="text-gray-500 text-sm">Update your personal details here.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    className="pl-10 h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 flex items-center justify-center">@</div>
                  <Input
                    className="pl-10 h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">🇮🇳 +91</span>
                  <Input
                    className={`pl-16 h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all ${(!user.phone && isIncomplete) ? 'border-red-500 ring-1 ring-red-200' : ''}`}
                    placeholder="9876543210"
                    value={user.phone}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Account Type</label>
                <Input className="h-12 rounded-xl border-gray-200 bg-gray-100" value={user.accountType} disabled />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="text-blue-600 w-5 h-5" />
                <h3 className="text-lg font-bold text-gray-900">Academic Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Graduation CGPA <span className="text-red-500">*</span></label>
                  <Input
                    type="number" step="0.01" max="10"
                    className={`h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all ${(!user.graduationCGPA && isIncomplete) ? 'border-red-500 ring-1 ring-red-200' : ''}`}
                    value={user.graduationCGPA ?? ''}
                    onChange={(e) => setUser({ ...user, graduationCGPA: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">12th Percentage <span className="text-red-500">*</span></label>
                  <Input
                    type="number" step="0.01" max="100"
                    className={`h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all ${(!user.twelfthPercentage && isIncomplete) ? 'border-red-500 ring-1 ring-red-200' : ''}`}
                    value={user.twelfthPercentage ?? ''}
                    onChange={(e) => setUser({ ...user, twelfthPercentage: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">10th Percentage <span className="text-red-500">*</span></label>
                  <Input
                    type="number" step="0.01" max="100"
                    className={`h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all ${(!user.tenthPercentage && isIncomplete) ? 'border-red-500 ring-1 ring-red-200' : ''}`}
                    value={user.tenthPercentage ?? ''}
                    onChange={(e) => setUser({ ...user, tenthPercentage: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Change Avatar</h4>
              <div className="flex items-center gap-6 p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.image || ''} />
                  <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div
                    className="flex flex-col items-center justify-center w-full h-32 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Click to upload</p>
                    <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Enable Auto Payout</h4>
                  <p className="text-xs text-gray-500">Automatically withdraw earnings to your account</p>
                </div>
                <Switch
                  checked={user.autoPayout}
                  onCheckedChange={(checked) => setUser({ ...user, autoPayout: checked })}
                />
              </div>
            </div>
          </div>
        );
      case 'subscription':
        return (
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-8 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Subscription Plan</h3>
              <p className="text-gray-500 text-sm">Manage your billing and subscription details.</p>
            </div>

            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-bold mb-1">CURRENT PLAN</p>
                <h2 className="text-2xl font-bold text-gray-900">Pro Member</h2>
                <p className="text-sm text-gray-600">$10/month • Renews on Aug 12, 2026</p>
              </div>
              <Badge className="bg-blue-600 text-white hover:bg-blue-700 h-8 px-4 rounded-lg">Active</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Free', 'Pro', 'Enterprise'].map((plan) => (
                <div key={plan} className={`p-6 rounded-2xl border ${plan === 'Pro' ? 'border-blue-500 bg-blue-50/30 ring-4 ring-blue-50' : 'border-gray-200'} cursor-pointer hover:border-blue-300 transition-all`}>
                  <h4 className="font-bold text-lg mb-2">{plan}</h4>
                  <p className="text-2xl font-bold mb-4">{plan === 'Free' ? '$0' : plan === 'Pro' ? '$10' : '$99'} <span className="text-sm font-normal text-gray-500">/mo</span></p>
                  <ul className="space-y-2 text-sm text-gray-600 mb-6">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Access to basic tests</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Limited reports</li>
                  </ul>
                  <Button variant={plan === 'Pro' ? 'default' : 'outline'} className="w-full rounded-xl">
                    {plan === 'Pro' ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-8 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Security Settings</h3>
              <p className="text-gray-500 text-sm">Update your password and security preferences.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Current Password</label>
                <Input type="password" className="h-12 rounded-xl border-gray-200 bg-gray-50/50" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">New Password</label>
                <Input type="password" className="h-12 rounded-xl border-gray-200 bg-gray-50/50" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                <Input type="password" className="h-12 rounded-xl border-gray-200 bg-gray-50/50" placeholder="••••••••" />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <Button className="rounded-xl px-8" variant="destructive">Update Password</Button>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-8 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Notifications</h3>
              <p className="text-gray-500 text-sm">Choose what notifications you want to receive.</p>
            </div>

            <div className="space-y-6">
              {[
                { title: 'Email Notifications', desc: 'Receive emails about your account activity.', icon: Mail },
                { title: 'Push Notifications', desc: 'Receive push notifications on your device.', icon: Smartphone },
                { title: 'Marketing Emails', desc: 'Receive emails about new features and offers.', icon: Bell }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">

      {isIncomplete && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Profile Incomplete</AlertTitle>
          <AlertDescription>
            You must complete your profile (Phone Number and Academic Details) to access the dashboard.
          </AlertDescription>
        </Alert>
      )}

      {/* Cover Image */}
      <div className="relative h-64 w-full rounded-[32px] overflow-hidden group">
        <img
          src={user.coverImage || '/images/default-cover.png'}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="secondary" onClick={() => coverInputRef.current?.click()}>
            <Camera className="w-4 h-4 mr-2" /> Change Cover
          </Button>
          <input
            type="file"
            ref={coverInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'coverImage')}
          />
        </div>
      </div>

      <div className="px-6 relative -mt-20 z-10 flex flex-col items-start gap-4">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 w-full">
          <div className="relative group">
            <Avatar className="w-32 h-32 border-4 border-white bg-white shadow-xl">
              <AvatarImage src={user.image || ''} />
              <AvatarFallback className="text-4xl">{user.name?.[0]}</AvatarFallback>
            </Avatar>
            <button
              className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-blue-600 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'image')}
            />
          </div>

          <div className="flex-1 mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0">{user.role === 'admin' ? 'Admin' : 'Pro'}</Badge>
            </div>
            <p className="text-gray-500 font-medium">{user.email}</p>
          </div>

          <div className="flex gap-3 mb-2">
            <Button className="rounded-xl px-6 bg-gray-900 text-white hover:bg-gray-800" onClick={handleUpdate} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

        {/* Left Settings Navigation */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[24px] p-2 border border-gray-100 shadow-sm">
            {[
              { id: 'personal', icon: User, label: 'Personal Info' },
              { id: 'subscription', icon: CreditCard, label: 'Subscription' },
              { id: 'security', icon: Lock, label: 'Security' },
              { id: 'notifications', icon: Bell, label: 'Notifications' }
            ]
              .filter(item => user.role !== 'admin' || item.id !== 'subscription')
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
          </div>

          {/* Go Pro Card */}

        </div>

        {/* Main Form Content */}
        <div className="lg:col-span-2 space-y-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

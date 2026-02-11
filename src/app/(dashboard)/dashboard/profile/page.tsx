"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Copy, Upload, CreditCard, Bell, Lock, User, Camera, Loader2, Save, CheckCircle, Smartphone, Mail, GraduationCap, AlertCircle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSearchParams, useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
          window.location.href = '/dashboard';
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
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-none p-8 border border-gray-100 shadow-sm space-y-8 aivalytics-card"
          >
            <div>
               <p className="text-primary text-caption font-semibold uppercase tracking-wide mb-2">User Profile</p>
               <h3 className="text-h1 text-gray-900">Personal Information</h3>
               <p className="text-body text-gray-500 mt-2">Manage your account details and contact information.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-caption text-gray-500 font-semibold uppercase tracking-wide">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-primary" />
                  <Input
                    className="pl-10 h-12 rounded-none border-gray-200 bg-white focus:bg-white transition-all font-medium text-gray-900 focus:ring-0 focus:border-primary"
                    placeholder="Enter full name"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-caption text-gray-500 font-semibold uppercase tracking-wide">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-primary" />
                  <Input
                    className="pl-10 h-12 rounded-none border-gray-200 bg-white focus:bg-white transition-all font-medium text-gray-900 focus:ring-0 focus:border-primary"
                    placeholder="example@edu.com"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-caption text-gray-500 font-semibold uppercase tracking-wide">Phone Number <span className="text-primary">*</span></label>
                <div className="relative group">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-primary" />
                  <Input
                    className={cn(
                        "pl-10 h-12 rounded-none border-gray-200 bg-white focus:bg-white transition-all font-medium text-gray-900 focus:ring-0 focus:border-primary",
                        (!user.phone && isIncomplete) ? 'border-primary ring-2 ring-primary/10' : ''
                    )}
                    placeholder="+91 9876543210"
                    value={user.phone}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-caption text-gray-500 font-semibold uppercase tracking-wide">Account Type</label>
                <Input className="h-12 rounded-none border-gray-200 bg-gray-50 font-medium text-gray-500 cursor-not-allowed" value={user.accountType} disabled />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-none text-primary">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-caption text-primary font-semibold uppercase tracking-wide">Academic Records</p>
                   <h3 className="text-ui font-semibold text-gray-900">Educational Performance</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-caption text-gray-500 font-semibold uppercase tracking-wide">Graduation CGPA <span className="text-primary">*</span></label>
                  <Input
                    type="number" step="0.01" max="10"
                    className={cn(
                        "h-12 rounded-none border-gray-200 bg-white focus:bg-white transition-all font-medium focus:ring-0 focus:border-primary",
                        (!user.graduationCGPA && isIncomplete) ? 'border-primary ring-2 ring-primary/10' : ''
                    )}
                    placeholder="8.5"
                    value={user.graduationCGPA ?? ''}
                    onChange={(e) => setUser({ ...user, graduationCGPA: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-caption text-gray-500 font-semibold uppercase tracking-wide">12th Percentage <span className="text-primary">*</span></label>
                  <Input
                    type="number" step="0.01" max="100"
                    className={cn(
                        "h-12 rounded-none border-gray-200 bg-white focus:bg-white transition-all font-medium focus:ring-0 focus:border-primary",
                        (!user.twelfthPercentage && isIncomplete) ? 'border-primary ring-2 ring-primary/10' : ''
                    )}
                    placeholder="85.5"
                    value={user.twelfthPercentage ?? ''}
                    onChange={(e) => setUser({ ...user, twelfthPercentage: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-caption text-gray-500 font-semibold uppercase tracking-wide">10th Percentage <span className="text-primary">*</span></label>
                  <Input
                    type="number" step="0.01" max="100"
                    className={cn(
                        "h-12 rounded-none border-gray-200 bg-white focus:bg-white transition-all font-medium focus:ring-0 focus:border-primary",
                        (!user.tenthPercentage && isIncomplete) ? 'border-primary ring-2 ring-primary/10' : ''
                    )}
                    placeholder="90.0"
                    value={user.tenthPercentage ?? ''}
                    onChange={(e) => setUser({ ...user, tenthPercentage: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <p className="text-caption text-gray-500 font-semibold uppercase tracking-wide mb-4">Profile Picture</p>
              <div className="flex flex-col lg:flex-row items-center gap-6 p-6 border border-gray-200 rounded-none bg-gray-50 hover:bg-white hover:border-primary/30 transition-all group">
                <Avatar className="w-24 h-24 rounded-none border-4 border-white shadow-lg group-hover:scale-105 transition-transform">
                  <AvatarImage src={user.image || ''} />
                  <AvatarFallback className="bg-primary text-white text-2xl font-bold">{user.name?.[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 w-full">
                  <div
                    className="flex flex-col items-center justify-center w-full h-32 bg-white rounded-none border border-gray-200 cursor-pointer hover:border-primary hover:shadow-md transition-all relative overflow-hidden group/upload"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/upload:opacity-100 transition-opacity" />
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-none flex items-center justify-center mb-2 group-hover/upload:scale-110 transition-transform relative z-10">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-ui-sm text-gray-900 font-semibold uppercase tracking-wide relative z-10">Upload New Photo</p>
                    <p className="text-caption text-gray-400 mt-1 relative z-10">JPG, PNG or GIF (Max 5MB)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between p-6 bg-primary/5 border border-primary/20 rounded-none">
                <div>
                   <h4 className="text-ui font-semibold text-gray-900">Auto Payout</h4>
                   <p className="text-caption text-gray-500 mt-1">Enable automatic payouts to your account</p>
                </div>
                <Switch
                  checked={user.autoPayout}
                  onCheckedChange={(checked) => setUser({ ...user, autoPayout: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </motion.div>
        );
      case 'security':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-none p-8 border border-gray-100 shadow-sm space-y-8 aivalytics-card"
          >
            <div>
               <p className="text-red-500 text-caption font-semibold uppercase tracking-wide mb-2">Security Settings</p>
               <h3 className="text-h1 text-gray-900">Password & Security</h3>
               <p className="text-body text-gray-500 mt-2">Manage your password and security preferences.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-caption text-gray-500 font-semibold uppercase tracking-wide">Current Password</label>
                <Input type="password" className="h-12 rounded-none border-gray-200 bg-white font-medium focus:ring-0 focus:border-primary" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label className="text-caption text-gray-500 font-semibold uppercase tracking-wide">New Password</label>
                <Input type="password" className="h-12 rounded-none border-gray-200 bg-white font-medium focus:ring-0 focus:border-primary" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label className="text-caption text-gray-500 font-semibold uppercase tracking-wide">Confirm New Password</label>
                <Input type="password" className="h-12 rounded-none border-gray-200 bg-white font-medium focus:ring-0 focus:border-primary" placeholder="••••••••" />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <Button className="h-12 px-8 rounded-none bg-red-600 text-white hover:bg-red-700 text-ui-sm font-semibold uppercase tracking-wide shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl" variant="destructive">
                Update Password
              </Button>
            </div>
          </motion.div>
        );
      case 'notifications':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-none p-8 border border-gray-100 shadow-sm space-y-8 aivalytics-card"
          >
            <div>
               <p className="text-primary text-caption font-semibold uppercase tracking-wide mb-2">Notifications</p>
               <h3 className="text-h1 text-gray-900">Communication Preferences</h3>
               <p className="text-body text-gray-500 mt-2">Manage how you receive notifications and updates.</p>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Email Notifications', desc: 'Receive updates and announcements via email', icon: Mail },
                { title: 'Push Notifications', desc: 'Get instant alerts on your device', icon: Smartphone },
                { title: 'Newsletter', desc: 'Weekly digest of new content and features', icon: Bell }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-none border border-gray-200 hover:bg-gray-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-none flex items-center justify-center group-hover:scale-105 transition-all group-hover:bg-primary group-hover:text-white">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-ui font-semibold text-gray-900 group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-caption text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                </div>
              ))}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-1000">

        {isIncomplete && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-600 rounded-none p-6 shadow-lg border-l-4 border-l-red-600">
            <AlertCircle className="h-5 w-5" />
            <div className="ml-4">
                <AlertTitle className="text-ui-sm font-semibold uppercase tracking-wide">Profile Incomplete</AlertTitle>
                <AlertDescription className="text-body mt-1">
                  Please complete all required fields to access the full platform.
                </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Cover Image */}
        <div className="relative h-64 w-full rounded-none overflow-hidden group shadow-lg">
          <img
            src={user.coverImage || '/images/default-cover.png'}
            alt="Cover"
            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm">
            <Button 
              variant="secondary" 
              className="h-12 px-6 rounded-none text-ui-sm font-semibold uppercase tracking-wide bg-white text-gray-900 shadow-lg hover:bg-primary hover:text-white transition-all duration-300" 
              onClick={() => coverInputRef.current?.click()}
            >
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

        <div className="px-6 relative -mt-20 z-10">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 w-full">
            <div className="relative group">
              <Avatar className="w-32 h-32 rounded-none border-4 border-white bg-white shadow-xl transition-all duration-500 group-hover:scale-105">
                <AvatarImage src={user.image || ''} className="transition-transform duration-500 group-hover:scale-110" />
                <AvatarFallback className="text-4xl font-bold bg-primary text-white">{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <button
                className="absolute -bottom-1 -right-1 p-3 bg-gray-900 text-white rounded-none shadow-lg hover:bg-primary transition-all duration-300 z-20 transform hover:-translate-y-1 group/btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'image')}
              />
            </div>

            <div className="flex-1 mb-4 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
                <h1 className="text-h1 md:text-5xl text-gray-900">{user.name}</h1>
                <Badge className="bg-primary text-white border-0 px-4 py-1.5 rounded-none text-caption font-semibold uppercase tracking-wide shadow-md">
                  {user.role === 'admin' ? 'Admin' : 'Verified'}
                </Badge>
              </div>
              <p className="text-body text-gray-500 mt-2">{user.email}</p>
            </div>

            <div className="flex gap-4 mb-4">
              <Button 
                className="h-12 px-8 rounded-none bg-gray-900 text-white hover:bg-black text-ui-sm font-semibold uppercase tracking-wide shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl border-b-2 border-primary flex items-center gap-2" 
                onClick={handleUpdate} 
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12 px-6">

          {/* Left Settings Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-none p-2 border border-gray-100 shadow-md">
              {[
                { id: 'personal', icon: User, label: 'Personal Info' },
                { id: 'security', icon: Lock, label: 'Security' },
                { id: 'notifications', icon: Bell, label: 'Notifications' }
              ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                        "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-none transition-all duration-300 text-caption font-semibold uppercase tracking-wide group",
                        activeTab === item.id
                          ? 'bg-primary text-white shadow-md'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("w-4 h-4 transition-transform duration-300 group-hover:scale-110", activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-primary')} />
                      {item.label}
                    </div>
                    {activeTab === item.id && <CheckCircle className="w-4 h-4 text-white/60" />}
                  </button>
                ))}
            </div>

            {/* Logout Button */}
            <Button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full justify-start gap-3 h-12 rounded-none text-gray-500 hover:bg-red-50 hover:text-red-600 text-caption font-semibold uppercase tracking-wide transition-all duration-300 group bg-white border border-gray-100 hover:border-red-200"
            >
              <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              Sign Out
            </Button>
          </div>

          {/* Main Form Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

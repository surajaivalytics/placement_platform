"use client";

import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, MapPin, Mail, Phone, Linkedin } from "lucide-react";
import { BuilderPersonal } from "@/lib/builder/builderTypes";

interface StepPersonalProps {
    data: BuilderPersonal;
    onChange: (data: BuilderPersonal) => void;
}

export default function StepPersonal({ data, onChange }: StepPersonalProps) {
    const handleChange = (field: keyof BuilderPersonal, value: string) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-900/20">
                    <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Personal Details</h2>
                <p className="text-slate-500 mt-1">Let&apos;s start with your basic information</p>
            </div>

            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-700 font-medium">
                        First Name *
                    </Label>
                    <Input
                        id="firstName"
                        value={data.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        placeholder="John"
                        className="h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-700 font-medium">
                        Last Name *
                    </Label>
                    <Input
                        id="lastName"
                        value={data.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        placeholder="Doe"
                        className="h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                </Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="john.doe@example.com"
                    className="h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                />
            </div>

            {/* Phone */}
            <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                </Label>
                <Input
                    id="phone"
                    type="tel"
                    value={data.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                />
            </div>

            {/* Location Row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city" className="text-slate-700 font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        City *
                    </Label>
                    <Input
                        id="city"
                        value={data.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="San Francisco"
                        className="h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="country" className="text-slate-700 font-medium">
                        Country *
                    </Label>
                    <Input
                        id="country"
                        value={data.country}
                        onChange={(e) => handleChange("country", e.target.value)}
                        placeholder="USA"
                        className="h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                </div>
            </div>

            {/* LinkedIn (Optional) */}
            <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-slate-700 font-medium flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn Profile
                    <span className="text-slate-400 text-sm font-normal">(Optional)</span>
                </Label>
                <Input
                    id="linkedin"
                    value={data.linkedin || ""}
                    onChange={(e) => handleChange("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/johndoe"
                    className="h-12 border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                />
            </div>
        </motion.div>
    );
}

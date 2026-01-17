"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileQuestion,
  GraduationCap,
  Users,
  BarChart3,
  Briefcase,
  Settings,
  LogOut,
  Building2,
  BookOpen,
  ClipboardList,
  Mic,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Zap,
  HelpCircle,
  MonitorPlay,
  AudioLines
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

/* -------------------- Types -------------------- */

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  role?: "user" | "admin";
}

interface SidebarItemProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
  active: boolean;
  collapsed: boolean;
}

interface SidebarContentProps {
  role: "user" | "admin";
  collapsed: boolean;
  pathname: string;
}

/* -------------------- Sidebar Item -------------------- */

const SidebarItem = ({
  icon: Icon,
  label,
  href,
  active,
  collapsed,
}: SidebarItemProps) => (
  <Link href={href} className="block mb-1 group relative">
    <div
      className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
        active
          ? "bg-gray-100 text-gray-900 font-semibold"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
      )}
    >
      {active && (
        <motion.div
          layoutId="active-indicator"
          className="absolute left-0 h-8 w-1 bg-gray-900 rounded-r-full"
        />
      )}
      <Icon className="w-5 h-5" />
      {!collapsed && <span className="text-sm">{label}</span>}
    </div>
  </Link>
);

/* -------------------- Sidebar Content -------------------- */

const SidebarContent = ({
  role,
  collapsed,
  pathname,
}: SidebarContentProps) => {
  const userLinks = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/dashboard/placements", label: "Placements", icon: Briefcase },
    { href: "/dashboard/my-tests", label: "My Tests", icon: ClipboardList },
    { href: "/dashboard/interview-suite", label: "AI Interview Suite", icon: Mic },
    { href: "/dashboard/voice-assessment", label: "Voice Assessment", icon: AudioLines },
    { href: "/dashboard/topics", label: "Topics", icon: BookOpen },
    { href: "/dashboard/companies", label: "Companies", icon: Building2 },
    { href: "/dashboard/mock-tests", label: "Mock Tests", icon: MonitorPlay },
    { href: "/dashboard/results", label: "Results", icon: BarChart3 },
    { href: "/dashboard/profile", label: "Settings", icon: Settings },
  ];

  const adminLinks = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/tests", label: "Tests", icon: GraduationCap },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const links = role === "admin" ? adminLinks : userLinks;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-20 flex items-center px-6">
        {!collapsed ? (
          <span className="font-bold text-xl">AiValytics</span>
        ) : (
          <Zap />
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => (
          <SidebarItem
            key={link.href}
            {...link}
            active={pathname === link.href}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="w-5 h-5" />
            Log out
          </Button>
        </div>
      )}
    </div>
  );
};

/* -------------------- Main Sidebar -------------------- */

export default function Sidebar({
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
  role = "user",
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "hidden lg:flex fixed inset-y-0 left-0 bg-white transition-all border-r z-40",
          collapsed ? "w-24" : "w-64"
        )}
      >
        <SidebarContent role={role} collapsed={collapsed} pathname={pathname} />

        <Button
          size="icon"
          variant="outline"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 h-6 w-6 rounded-full"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </aside>

      {/* Mobile Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-gray-900 text-white rounded-full"
      >
        {mobileOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-xl"
          >
            <SidebarContent
              role={role}
              collapsed={false}
              pathname={pathname}
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

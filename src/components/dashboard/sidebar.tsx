"use client";

import React from "react";
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
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Zap,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

/* -------------------------------- Sidebar Item -------------------------------- */

interface SidebarItemProps {
  icon: any;
  label: string;
  href: string;
  active: boolean;
  collapsed: boolean;
}

const SidebarItem = ({
  icon: Icon,
  label,
  href,
  active,
  collapsed,
}: SidebarItemProps) => {
  return (
    <Link href={href} className="block mb-1 group relative">
      <div
        className={cn(
          "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
          active
            ? "text-gray-900 bg-gray-100 font-semibold"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80"
        )}
      >
        {/* Active Indicator (Left Border/Pill) */}
        {active && (
          <motion.div
            layoutId="active-nav-indicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-gray-900 rounded-r-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}

        <Icon
          className={cn(
            "w-5 h-5 flex-shrink-0 transition-colors",
            active ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
          )}
        />

        {!collapsed && (
          <span className="text-sm truncate">
            {label}
          </span>
        )}

        {/* Collapsed Tooltip */}
        {collapsed && (
          <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
            {label}
          </div>
        )}
      </div>
    </Link>
  );
};

/* -------------------------------- Sidebar -------------------------------- */

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  role?: string;
}

export default function Sidebar({ mobileOpen, setMobileOpen, collapsed, setCollapsed, role = 'user' }: SidebarProps) {
  const pathname = usePathname();

  const userLinks = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/dashboard/placements', label: 'Placements', icon: Briefcase },
    { href: '/dashboard/my-tests', label: 'My Tests', icon: ClipboardList },
    { href: '/dashboard/topics', label: 'Topics', icon: BookOpen },
    { href: '/dashboard/companies', label: 'Company', icon: Building2 },
    { href: '/dashboard/results', label: 'Results', icon: BarChart3 },
    { href: '/dashboard/profile', label: 'Setting', icon: Settings },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/placements', label: 'Placements', icon: Briefcase },
    { href: '/admin/placement-questions', label: 'Questions', icon: FileQuestion },
    { href: '/admin/tests', label: 'Tests', icon: GraduationCap },
    { href: '/admin/company-tests', label: 'Company Tests', icon: Building2 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/profile', label: 'Setting', icon: Settings },
  ];

  const links = role === 'admin' ? adminLinks : userLinks;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Header */}
      <div className={cn("h-20 flex items-center px-6", collapsed ? "justify-center px-2" : "")}>
        {!collapsed ? (
          <div className="flex items-center gap-2">
            {/* <div className="h-8 w-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div> */}
            <span className="font-bold text-xl tracking-tight text-gray-900">AiValytics</span>
          </div>
        ) : (
          <div className="h-8 w-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white fill-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
        {links.map((link) => (
          <SidebarItem
            key={link.href}
            icon={link.icon}
            label={link.label}
            href={link.href}
            active={pathname === link.href}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Footer / Upgrade Card */}
      <div className="p-4 mt-auto">
        {!collapsed && role !== 'admin' ? (
          <div className="bg-gray-50 rounded-2xl p-4 relative overflow-hidden group">
            {/* Decorative blob */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 text-center space-y-3">
              <div className="mx-auto w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Zap className="w-5 h-5 text-gray-900 fill-gray-900" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Upgrade to Pro</h4>
                <p className="text-xs text-gray-500 mt-1">Get 1 month free and unlock</p>
              </div>
              <Button className="w-full rounded-xl h-10 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold shadow-none border-0 transition-colors">
                Upgrade
              </Button>
            </div>
          </div>
        ) : !collapsed ? null : (
          <div className="flex justify-center">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100">
              <HelpCircle className="w-5 h-5 text-gray-500" />
            </Button>
          </div>
        )}

        {/* User / Logout Section (Mobile or Desktop Bottom) */}
        {!collapsed && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500 hover:text-gray-900 hover:bg-transparent px-2">
              <HelpCircle className="w-5 h-5" />
              <span>Help & information</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-500 hover:text-red-600 hover:bg-transparent px-2 mt-1"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col bg-white transition-all duration-300 ease-in-out border-r border-gray-100",
          collapsed ? "w-24" : "w-[280px]"
        )}
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <div className="absolute top-8 -right-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-6 w-6 rounded-full bg-white border-gray-200 shadow-sm hover:bg-gray-50 p-0.5"
          >
            {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: mobileOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] z-50 shadow-2xl"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}

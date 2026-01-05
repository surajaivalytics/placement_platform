'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookOpen, Building2, BarChart3, Settings, Users, FileQuestion, GraduationCap, ClipboardList, X, Menu, Briefcase } from 'lucide-react';
import { Role } from '@/types';
import { useState } from 'react';

interface SidebarProps {
  role: Role;
}

const userLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/placements', label: 'Placements', icon: Briefcase },
  { href: '/dashboard/my-tests', label: 'My Tests', icon: ClipboardList },
  { href: '/dashboard/topics', label: 'Aptitude Topics', icon: BookOpen },
  { href: '/dashboard/companies', label: 'Company Tests', icon: Building2 },
  { href: '/dashboard/results', label: 'My Results', icon: BarChart3 },
  { href: '/dashboard/profile', label: 'Profile', icon: Settings },
];

const adminLinks = [
  { href: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
  { href: '/admin/placements', label: 'Placements', icon: Briefcase },
  { href: '/admin/placement-questions', label: 'Placement Questions', icon: FileQuestion },
  { href: '/admin/questions', label: 'Questions', icon: FileQuestion },
  { href: '/admin/tests', label: 'Tests', icon: GraduationCap },
  { href: '/admin/company-tests', label: 'Company Tests', icon: Building2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

interface SidebarContentProps {
  role: Role;
  pathname: string;
  onLinkClick: () => void;
}

const SidebarContent = ({ role, pathname, onLinkClick }: SidebarContentProps) => {
  const links = role === 'admin' ? adminLinks : userLinks;

  return (
    <>
      <div className="p-6 border-b border-border/30">
        <h1 className="text-xl font-bold text-foreground">
          Aivalytics
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {role === 'admin' ? 'Admin Portal' : 'Skill Builder'}
        </p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-foreground text-background"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 mr-3 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/30">
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-xs font-semibold text-foreground mb-1">Need Help?</p>
          <p className="text-xs text-muted-foreground">
            Check our docs or contact support.
          </p>
        </div>
      </div>
    </>
  );
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-60 bg-card border-r border-border/50 hidden lg:flex flex-col">
        <SidebarContent role={role} pathname={pathname} onLinkClick={() => {}} />
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-foreground text-background rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-card border-r border-border/50 flex flex-col z-50 transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent role={role} pathname={pathname} onLinkClick={() => setIsMobileMenuOpen(false)} />
      </aside>
    </>
  );
}

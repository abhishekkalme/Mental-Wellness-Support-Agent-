import {
  Home,
  Heart,
  BookText,
  Wind,
  Moon,
  BarChart3,
  MessageSquare,
  Sparkles,
  Library,
  Users,
  Stethoscope,
  Settings,
  ShieldAlert,
  Music,
  ShieldUser,
  CalendarDays,
  ListChecks,
  LayoutDashboard,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  roles?: ('admin' | 'therapist')[];
  className?: string;
  section?: 'primary' | 'wellness' | 'progress' | 'ai' | 'social' | 'tools' | 'more' | 'support';
};

export const allNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'primary' },
  { name: 'Check-in', href: '/mood', icon: Heart, section: 'wellness' },
  { name: 'Journal', href: '/journal', icon: BookText, section: 'wellness' },
  { name: 'Breathing', href: '/breathing', icon: Wind, section: 'wellness' },
  { name: 'Sleep', href: '/sleep', icon: Moon, section: 'wellness' },
  { name: 'Habits', href: '/habits', icon: ListChecks, section: 'progress' },
  { name: 'Chat', href: '/chat', icon: MessageSquare, section: 'ai' },
  { name: 'Community', href: '/community', icon: Users, section: 'social' },
  { name: 'Therapists', href: '/therapists', icon: Stethoscope, section: 'tools' },
  { name: 'Academic Calendar', href: '/academic-calendar', icon: CalendarDays, section: 'tools' },
  { name: 'Crisis Support', href: '/crisis', icon: ShieldAlert, section: 'support' },
  { name: 'Settings', href: '/settings', icon: Settings, section: 'more' },
  { name: 'Admin', href: '/admin', icon: ShieldUser, roles: ['admin'], section: 'more' },
  {
    name: 'Therapist Admin',
    href: '/therapist-admin/dashboard',
    icon: LayoutDashboard,
    roles: ['therapist'],
    section: 'more',
  },
];

export const mobilePrimaryItems: string[] = ['/dashboard', '/mood', '/chat', '/crisis'];

export function filterNavByRole(items: NavItem[], roles: string[]): NavItem[] {
  return items.filter((item) => {
    if (!item.roles?.length) return true;
    return item.roles.some((r) => roles.includes(r));
  });
}

export function getNavBySection(items: NavItem[]): Record<string, NavItem[]> {
  const sections: Record<string, NavItem[]> = {
    primary: [],
    wellness: [],
    progress: [],
    ai: [],
    social: [],
    tools: [],
    more: [],
    support: [],
  };
  items.forEach((item) => {
    const section = item.section || 'more';
    if (sections[section]) {
      sections[section].push(item);
    }
  });
  return sections;
}

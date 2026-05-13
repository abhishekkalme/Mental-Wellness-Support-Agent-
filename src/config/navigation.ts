import { Home, Heart, BookText, Wind, Moon, BarChart3, MessageSquare, Sparkles, Library, Users, Stethoscope, Settings, ShieldAlert, Music, Dumbbell, CalendarDays, ListChecks } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  roles?: ('admin' | 'mentor')[];
  className?: string;
  section?: 'primary' | 'wellness' | 'progress' | 'ai' | 'social' | 'tools' | 'more' | 'support';
};

export const allNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, section: 'primary' },
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
  { name: 'Mentor Hub', href: '/mentor', icon: Stethoscope, roles: ['mentor', 'admin'], section: 'more' },
  { name: 'Admin', href: '/admin', icon: Settings, roles: ['admin'], section: 'more' },
];

export const mobilePrimaryItems: string[] = ['/dashboard', '/mood', '/chat', '/crisis'];

export function filterNavByRole(items: NavItem[], role: string): NavItem[] {
  return items.filter((item) => {
    if (!item.roles?.length) return true;
    return item.roles.includes(role as 'admin' | 'mentor');
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
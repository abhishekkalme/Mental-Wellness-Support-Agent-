import { Home, Heart, BookText, Brain, Wind, Moon, BarChart3, MessageSquare, Sparkles, Library, Users, Stethoscope, Settings, ShieldAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react'; 

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  roles?: ('admin' | 'mentor')[];
  className?: string;
};

export const allNavItems: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Check-in', href: '/mood', icon: Heart },
  { name: 'Journal', href: '/journal', icon: BookText },
  { name: 'Meditate', href: '/meditation', icon: Brain },
  { name: 'Breathing', href: '/breathing', icon: Wind },
  { name: 'Sleep', href: '/sleep', icon: Moon },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'AI Companion', href: '/agent-chat', icon: MessageSquare },
  { name: 'Habits', href: '/habits', icon: Sparkles },
  { name: 'Rescue', href: '/crisis', icon: ShieldAlert,className: 'text-red-400' },
  { name: 'Mentor hub', href: '/mentor', icon: Stethoscope, roles: ['mentor', 'admin'] },
  { name: 'Admin', href: '/admin', icon: Settings, roles: ['admin'] },
];

export const mobilePrimaryItems: string[] = ['/', '/dashboard', '/agent-chat', '/mood'];

export function filterNavByRole(items: NavItem[], role: string): NavItem[] {
  return items.filter((item) => {
    if (!item.roles?.length) return true;
    return item.roles.includes(role as 'admin' | 'mentor');
  });
}
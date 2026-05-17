'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ProviderId } from '@/lib/types';
import {
  Settings,
  Save,
  Server,
  Zap,
  Users,
  LayoutDashboard,
  ShieldAlert,
  Activity,
  UserCheck,
  MessageSquare,
  AlertTriangle,
  Stethoscope,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trash2,
  Brain,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type TabId = 'overview' | 'users' | 'ai' | 'community' | 'crisis' | 'system' | 'therapists';

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  roleBreakdown: Record<string, number>;
  onboardedCount: number;
  pendingOnboarding: number;
  totalPosts: number;
  reportedPosts: number;
  totalBookings: number;
  totalTherapists: number;
}

interface AdminUser {
  _id: string;
  name: string;
  username: string;
  email?: string;
  role: string;
  onboarded: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

interface AISettings {
  provider: ProviderId;
  model: string;
  apiKey: string;
  updatedAt: string;
}

interface ReportedPost {
  _id: string;
  author: { _id: string; name: string; username: string; image?: string; role: string } | null;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  reportCount: number;
  stats: { likes: number; comments: number; saves: number };
  tags: string[];
}

interface ModerationResponse {
  posts: ReportedPost[];
  total: number;
  page: number;
  totalPages: number;
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'therapists', label: 'Therapists', icon: Stethoscope },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'ai', label: 'AI Config', icon: Brain },
  { id: 'community', label: 'Community', icon: MessageSquare },
  { id: 'crisis', label: 'Crisis', icon: ShieldAlert },
  { id: 'system', label: 'System', icon: Activity },
];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-white/40">{label}</p>
          <p className="text-3xl font-black text-white">{value}</p>
          {sub && <p className="text-xs text-white/30">{sub}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-white/5', className)} />;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'therapists':
        return <AdminTherapistsTab />;
      case 'users':
        return <UsersTab />;
      case 'ai':
        return <AIConfigTab />;
      case 'community':
        return <CommunityTab />;
      case 'crisis':
        return <CrisisTab />;
      case 'system':
        return <SystemTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D08] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E2FF6F]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-40 left-0 w-[500px] h-[500px] bg-[#E2FF6F]/3 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 px-4 md:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#E2FF6F]/10 flex items-center justify-center border border-[#E2FF6F]/20">
            <Settings className="w-6 h-6 text-[#E2FF6F]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Console</h1>
            <p className="text-xs text-white/40 font-bold uppercase tracking-[0.15em]">
              Platform Control &amp; Configuration
            </p>
          </div>
        </div>

        <div className="flex gap-1 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-[#E2FF6F]/10 text-[#E2FF6F] border border-[#E2FF6F]/20'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {renderTab()}
      </div>
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch('/api/admin/dashboard/stats'),
          fetch('/api/admin/users?limit=5'),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (usersRes.ok) {
          const u = (await usersRes.json()) as UsersResponse;
          setRecentUsers(u.users);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-white/30 font-bold">Failed to load platform stats</p>
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-rose-500/10 text-rose-400',
    therapist: 'bg-purple-500/10 text-purple-400',
    user: 'bg-emerald-500/10 text-emerald-400',
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          sub={`${stats.activeUsers} active (7d)`}
          color="bg-sky-500/10 text-sky-400"
        />
        <StatCard
          icon={UserCheck}
          label="Onboarded"
          value={stats.onboardedCount}
          sub={`${stats.pendingOnboarding} pending`}
          color="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          icon={MessageSquare}
          label="Community Posts"
          value={stats.totalPosts}
          sub={`${stats.reportedPosts} reported`}
          color="bg-violet-500/10 text-violet-400"
        />
        <StatCard
          icon={Stethoscope}
          label="Therapists"
          value={stats.totalTherapists}
          sub={`${stats.totalBookings} bookings`}
          color="bg-amber-500/10 text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">
            Users by Role
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.roleBreakdown).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      role === 'admin'
                        ? 'bg-rose-400'
                        : role === 'therapist'
                          ? 'bg-purple-400'
                          : 'bg-emerald-400'
                    )}
                  />
                  <span className="text-sm font-bold text-white capitalize">{role}</span>
                </div>
                <span className="text-sm font-mono text-white/60">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">
            Recent Signups
          </h3>
          {recentUsers.length === 0 ? (
            <p className="text-white/20 text-sm">No recent signups</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60 shrink-0">
                      {u.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{u.name}</p>
                      <p className="text-xs text-white/40 truncate">{u.email || u.username}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase px-2 py-0.5 rounded-md',
                      roleColors[u.role] || 'bg-white/5 text-white/40'
                    )}
                  >
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [onboardedFilter, setOnboardedFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const pageSize = 15;

  const fetchUsers = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(p));
        params.set('limit', String(pageSize));
        if (search) params.set('search', search);
        if (roleFilter) params.set('role', roleFilter);
        if (onboardedFilter) params.set('onboarded', onboardedFilter);
        const res = await fetch(`/api/admin/users?${params}`);
        if (res.ok) {
          const data = (await res.json()) as UsersResponse;
          setUsers(data.users);
          setTotal(data.total);
          setPage(data.page);
          setTotalPages(data.totalPages);
        }
      } catch {}
      setLoading(false);
    },
    [search, roleFilter, onboardedFilter]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const updateRole = async (userId: string, role: string) => {
    setSavingId(userId);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      fetchUsers(page);
    } catch {}
    setSavingId(null);
  };

  const togglePremium = async (userId: string, isPremium: boolean) => {
    setSavingId(userId);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPremium: !isPremium }),
      });
      fetchUsers(page);
    } catch {}
    setSavingId(null);
  };

  const deleteUser = async (userId: string) => {
    setDeletingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('User deleted');
        fetchUsers(page);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete user');
      }
    } catch {
      toast.error('Failed to delete user');
    }
    setDeletingId(null);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-[#E2FF6F]/50 placeholder-white/20"
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 px-4 rounded-xl bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-[#E2FF6F]/50"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="therapist">Therapist</option>
          <option value="admin">Admin</option>
        </select>
        <select
          className="h-10 px-4 rounded-xl bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-[#E2FF6F]/50"
          value={onboardedFilter}
          onChange={(e) => setOnboardedFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="true">Onboarded</option>
          <option value="false">Pending</option>
        </select>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-wider text-white/30">
                  User
                </th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-wider text-white/30 hidden md:table-cell">
                  Email
                </th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-wider text-white/30">
                  Role
                </th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-wider text-white/30 hidden sm:table-cell">
                  Status
                </th>
                <th className="text-left p-4 text-[10px] font-bold uppercase tracking-wider text-white/30 hidden lg:table-cell">
                  Joined
                </th>
                <th className="text-right p-4 text-[10px] font-bold uppercase tracking-wider text-white/30">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-4">
                      <Skeleton className="h-8" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/20 text-sm">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60 shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{u.name}</p>
                          <p className="text-[10px] text-white/30">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-white/50 text-xs hidden md:table-cell">
                      {u.email || '—'}
                    </td>
                    <td className="p-4">
                      <select
                        className={cn(
                          'text-[10px] font-bold px-2 py-1 rounded-md border appearance-none cursor-pointer',
                          u.role === 'admin'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : u.role === 'therapist'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        )}
                        value={u.role}
                        disabled={savingId === u._id}
                        onChange={(e) => updateRole(u._id, e.target.value)}
                      >
                        <option value="user" className="bg-[#0A0D08]">
                          user
                        </option>
                        <option value="therapist" className="bg-[#0A0D08]">
                          therapist
                        </option>
                        <option value="admin" className="bg-[#0A0D08]">
                          admin
                        </option>
                      </select>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md',
                            u.onboarded
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          )}
                        >
                          {u.onboarded ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {u.onboarded ? 'Done' : 'Pending'}
                        </div>
                        {u.isPremium && (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-purple-500/10 text-purple-400">
                            Premium
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-white/30 text-xs hidden lg:table-cell">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => togglePremium(u._id, u.isPremium)}
                          disabled={savingId === u._id}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-purple-400 transition-all disabled:opacity-50"
                          title={u.isPremium ? 'Remove Premium' : 'Grant Premium'}
                        >
                          {savingId === u._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Zap className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {confirmDelete === u._id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => deleteUser(u._id)}
                              disabled={deletingId === u._id}
                              className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all disabled:opacity-50"
                              title="Confirm delete"
                            >
                              {deletingId === u._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all"
                              title="Cancel"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(u._id)}
                            disabled={u.role === 'admin'}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/30 hover:text-rose-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            title={u.role === 'admin' ? 'Cannot delete admin' : 'Delete user'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-white/30">
          {total} user{total !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUsers(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/50 font-mono">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => fetchUsers(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AIConfigTab() {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/settings/ai');
        if (res.ok) setSettings(await res.json());
        else {
          setError('Failed to load AI settings');
          toast.error('Failed to load AI settings');
        }
      } catch {
        setError('Failed to load AI settings');
        toast.error('Failed to load AI settings');
      }
      setLoading(false);
    }
    load();
  }, []);

  async function save(next: Partial<AISettings>) {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: next.provider ?? settings.provider,
          apiKey: typeof next.apiKey === 'string' ? next.apiKey : undefined,
          model: typeof next.model === 'string' ? next.model : undefined,
        }),
      });
      if (res.ok) {
        setSettings(await res.json());
        toast.success('AI settings saved');
      } else {
        setError('Failed to save');
        toast.error('Failed to save AI settings');
      }
    } catch {
      setError('Failed to save');
      toast.error('Failed to save AI settings');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-[#E2FF6F]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            AI Provider Configuration
          </h3>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
            Provider Engine
          </label>
          <select
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-[#E2FF6F]/50"
            value={settings?.provider || 'groq'}
            onChange={(e) =>
              setSettings((s) => (s ? { ...s, provider: e.target.value as ProviderId } : s))
            }
          >
            <option value="groq" className="bg-[#0A0D08]">
              Groq (Llama 3.1 8B)
            </option>
            <option value="gemini" className="bg-[#0A0D08]">
              Gemini (Free-Tier)
            </option>
            <option value="openrouter" className="bg-[#0A0D08]">
              OpenRouter
            </option>
            <option value="ollama" className="bg-[#0A0D08]">
              Ollama (Local)
            </option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Model</label>
          <input
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-[#E2FF6F]/50 placeholder-white/20"
            value={settings?.model || ''}
            onChange={(e) => setSettings((s) => (s ? { ...s, model: e.target.value } : s))}
            placeholder="e.g. gemini-1.5-flash / llama-3.1-8b-instant"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
            API Key
          </label>
          <input
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-amber-300 outline-none focus:border-[#E2FF6F]/50 placeholder-amber-400/30 font-mono"
            defaultValue=""
            placeholder={settings?.apiKey ? `Current: ${settings.apiKey}` : 'Enter new API key...'}
            onChange={(e) => setSettings((s) => (s ? { ...s, apiKey: e.target.value } : s))}
            type="password"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-medium text-rose-400">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-[10px] text-white/30 font-mono">
            Last updated:{' '}
            {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleString() : 'N/A'}
          </span>
          <Button
            onClick={() =>
              save({
                provider: settings!.provider,
                model: settings!.model,
                apiKey: settings!.apiKey.startsWith('***') ? undefined : settings!.apiKey,
              })
            }
            className="rounded-xl bg-[#E2FF6F] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#d4f056] disabled:opacity-50"
            disabled={saving || !settings}
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1.5" />
            )}
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CommunityTab() {
  const [posts, setPosts] = useState<ReportedPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPosts = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/moderation/posts?page=${p}&limit=10`);
      if (res.ok) {
        const data = (await res.json()) as ModerationResponse;
        setPosts(data.posts);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const deletePost = async (postId: string) => {
    setDeleting(postId);
    try {
      await fetch(`/api/admin/moderation/posts?id=${postId}`, { method: 'DELETE' });
      fetchPosts(page);
    } catch {}
    setDeleting(null);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <span className="text-xs text-white/40">
          {total} reported post{total !== 1 ? 's' : ''} awaiting review
        </span>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-10 text-center backdrop-blur-md">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-white/40">No reported posts</p>
            <p className="text-xs text-white/20 mt-1">All community content looks clean</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/60">
                      {post.author?.name || 'Unknown'}
                    </span>
                    <span className="text-[10px] text-white/20">•</span>
                    <span className="text-[10px] text-white/30 capitalize">{post.type}</span>
                    <span className="text-[10px] text-white/20">•</span>
                    <span className="text-[10px] text-white/30">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400/80 text-[10px] font-bold ml-auto">
                      <AlertTriangle className="w-3 h-3" />
                      {post.reportCount} report{post.reportCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-white/80">{post.title}</p>
                  <p className="text-sm text-white/70 line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>
                  {post.tags?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {post.tags.map((t: string) => (
                        <span
                          key={t}
                          className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-white/30">
                    <span>❤️ {post.stats?.likes || 0}</span>
                    <span>💬 {post.stats?.comments || 0}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => deletePost(post._id)}
                    disabled={deleting === post._id}
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-white/30 hover:text-rose-400 transition-all disabled:opacity-50"
                    title="Delete post"
                  >
                    {deleting === post._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => fetchPosts(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/50 font-mono">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => fetchPosts(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function CrisisTab() {
  const [helplines, setHelplines] = useState<
    { _id: string; country: string; name: string; phone?: string; link?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/crisis/helplines');
        if (res.ok) setHelplines(await res.json());
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Crisis Helplines
          </h3>
          <span className="text-[10px] text-white/30 ml-auto">{helplines.length} entries</span>
        </div>

        {loading ? (
          <Skeleton className="h-32" />
        ) : helplines.length === 0 ? (
          <p className="text-white/20 text-sm">No helplines configured</p>
        ) : (
          <div className="grid gap-2">
            {helplines.map((h) => (
              <div
                key={h._id}
                className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5"
              >
                <div>
                  <p className="text-sm font-bold text-white">{h.name}</p>
                  <p className="text-[10px] text-white/40">{h.country}</p>
                </div>
                <div className="text-right">
                  {h.phone && <p className="text-xs font-mono text-[#E2FF6F]">{h.phone}</p>}
                  {h.link && (
                    <p className="text-[10px] text-white/30 truncate max-w-[200px]">{h.link}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminTherapistsTab() {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTherapists = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(p));
        params.set('limit', '20');
        if (statusFilter) params.set('status', statusFilter);
        if (search) params.set('search', search);
        const res = await fetch(`/api/admin/therapists?${params}`);
        if (res.ok) {
          const data = await res.json();
          setTherapists(data.therapists || []);
          setTotal(data.total);
          setPage(data.page);
          setTotalPages(data.totalPages);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, search]
  );

  useEffect(() => {
    fetchTherapists(1);
  }, [fetchTherapists]);

  const updateVerification = async (id: string, status: string, notes?: string) => {
    setUpdatingId(id);
    try {
      await fetch(`/api/admin/therapists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: status, verificationNotes: notes || '' }),
      });
      fetchTherapists(page);
    } catch {
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-[#E2FF6F]/50 placeholder-white/20"
            placeholder="Search by name, specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 px-4 rounded-xl bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-[#E2FF6F]/50"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-[10px] font-bold uppercase text-white/30">
                  Therapist
                </th>
                <th className="text-left p-4 text-[10px] font-bold uppercase text-white/30 hidden md:table-cell">
                  Specialties
                </th>
                <th className="text-left p-4 text-[10px] font-bold uppercase text-white/30">
                  Status
                </th>
                <th className="text-left p-4 text-[10px] font-bold uppercase text-white/30 hidden sm:table-cell">
                  Rating
                </th>
                <th className="text-left p-4 text-[10px] font-bold uppercase text-white/30 hidden lg:table-cell">
                  Bookings
                </th>
                <th className="text-right p-4 text-[10px] font-bold uppercase text-white/30">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-4">
                      <div className="h-8 bg-white/5 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : therapists.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/20 text-sm">
                    No therapists found
                  </td>
                </tr>
              ) : (
                therapists.map((t: any) => (
                  <tr key={t._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-xs font-bold text-purple-400 shrink-0">
                          {t.user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {t.user?.name || 'Unknown'}
                          </p>
                          <p className="text-[10px] text-white/30">{t.title || 'Therapist'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {(t.specializations || []).slice(0, 2).map((s: string) => (
                          <span
                            key={s}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50"
                          >
                            {s}
                          </span>
                        ))}
                        {(t.specializations?.length || 0) > 2 && (
                          <span className="text-[10px] text-white/30">
                            +{t.specializations.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                          t.verificationStatus === 'verified'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : t.verificationStatus === 'rejected'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {t.verificationStatus || 'pending'}
                      </span>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className="text-xs text-white">
                        {t.averageRating > 0 ? `${t.averageRating.toFixed(1)} ⭐` : 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-xs text-white/60">{t.totalBookings || 0}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {t.verificationStatus !== 'verified' && (
                          <button
                            onClick={() => updateVerification(t._id, 'verified')}
                            disabled={updatingId === t._id}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/30 hover:text-emerald-400 transition-all disabled:opacity-50"
                            title="Verify"
                          >
                            {updatingId === t._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        {t.verificationStatus !== 'rejected' && (
                          <button
                            onClick={() => updateVerification(t._id, 'rejected')}
                            disabled={updatingId === t._id}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/30 hover:text-rose-400 transition-all disabled:opacity-50"
                            title="Reject"
                          >
                            {updatingId === t._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        {t.verificationStatus !== 'pending' && (
                          <button
                            onClick={() => updateVerification(t._id, 'pending')}
                            disabled={updatingId === t._id}
                            className="p-1.5 rounded-lg hover:bg-amber-500/10 text-white/30 hover:text-amber-400 transition-all disabled:opacity-50"
                            title="Reset to pending"
                          >
                            {updatingId === t._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/30">
            {total} therapist{total !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTherapists(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-white/50 font-mono">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => fetchTherapists(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SystemTab() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/dashboard/stats');
        if (res.ok) setStats(await res.json());
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const providers = [
    { name: 'Groq', model: 'llama-3.1-8b-instant', status: 'ready', priority: 1 },
    { name: 'Gemini', model: 'gemini-1.5-flash', status: 'ready', priority: 2 },
    { name: 'OpenRouter', model: 'configurable', status: 'standby', priority: 3 },
    { name: 'Ollama', model: 'local', status: 'standby', priority: 4 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">LLM Providers</h3>
        </div>
        <div className="space-y-2">
          {providers.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    p.status === 'ready'
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                      : p.status === 'standby'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                  )}
                />
                <div>
                  <p className="text-sm font-bold text-white">{p.name}</p>
                  <p className="text-[10px] text-white/40">{p.model}</p>
                </div>
              </div>
              <span
                className={cn(
                  'text-[10px] font-bold uppercase px-2 py-0.5 rounded-md',
                  p.status === 'ready'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                )}
              >
                Priority {p.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Platform Overview
          </h3>
        </div>
        {loading ? (
          <Skeleton className="h-32" />
        ) : (
          <div className="space-y-3">
            {[
              {
                label: 'Total Users',
                value: stats?.totalUsers || 0,
                icon: Users,
                color: 'text-sky-400',
              },
              {
                label: 'Active (7d)',
                value: stats?.activeUsers || 0,
                icon: TrendingUp,
                color: 'text-emerald-400',
              },
              {
                label: 'Onboarding Rate',
                value: stats
                  ? `${Math.round((stats.onboardedCount / Math.max(stats.totalUsers, 1)) * 100)}%`
                  : '0%',
                icon: UserCheck,
                color: 'text-violet-400',
              },
              {
                label: 'Report Rate',
                value: stats
                  ? `${Math.round((stats.reportedPosts / Math.max(stats.totalPosts, 1)) * 100)}%`
                  : '0%',
                icon: AlertTriangle,
                color: 'text-amber-400',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('w-4 h-4', item.color)} />
                    <span className="text-xs text-white/60">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white font-mono">{item.value}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

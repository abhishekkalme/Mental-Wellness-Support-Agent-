'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  Users,
  Search,
  MessageSquare,
  Heart,
  ShieldCheck,
  Plus,
  Send,
  X,
  Database,
  AlertCircle,
  Bookmark,
  Flag,
  Bell,
  MoreVertical,
  Loader2,
  Sparkles,
  TrendingUp,
  Clock,
  Filter,
  UserPlus,
  BookOpen,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  Brain,
  Hash,
  Check,
  Trash2,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export interface CommunityStats {
  totalMembers: number;
  activeNow: number;
  totalDiscussions: number;
  discussionsToday: number;
}

export interface PostAuthor {
  _id: string;
  name: string;
  username: string;
  image?: string;
  roles: string[];
}

export interface Post {
  _id: string;
  author: PostAuthor;
  title: string;
  content: string;
  type: 'discussion' | 'support' | 'achievement' | 'question' | 'resource';
  isAnonymous: boolean;
  tags: string[];
  language: string;
  mood?: string;
  stats: { likes: number; comments: number; saves: number };
  isLiked: boolean;
  userReaction: string | null;
  isSaved: boolean;
  createdAt: string;
  reportCount?: number;
}

export interface Comment {
  _id: string;
  author: PostAuthor;
  content: string;
  parentComment: string | null;
  isAnonymous: boolean;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
  createdAt: string;
}

export interface Notification {
  _id: string;
  type: string;
  sourceUser: { _id: string; name: string; image?: string };
  message: string;
  read: boolean;
  createdAt: string;
  post?: string;
  comment?: string;
}

const EMOJI_REACTIONS = ['💙', '💪', '🧘', '🌱', '🙏', '🔥'];

function timeAgo(date: string) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'recently';
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'support':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'achievement':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'question':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    case 'resource':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    default:
      return 'bg-white/5 text-white/50 border-white/10';
  }
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function SkeletonPost() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/10" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-24 bg-white/10 rounded" />
          <div className="h-2.5 w-16 bg-white/5 rounded" />
        </div>
      </div>
      <div className="h-4 w-3/4 bg-white/10 rounded" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-white/5 rounded" />
        <div className="h-3 w-2/3 bg-white/5 rounded" />
      </div>
      <div className="flex gap-4 pt-2">
        <div className="h-4 w-12 bg-white/5 rounded" />
        <div className="h-4 w-12 bg-white/5 rounded" />
        <div className="h-4 w-12 bg-white/5 rounded" />
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-white/20" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-white/40 max-w-xs mb-5">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E2FF6F]/10 border border-[#E2FF6F]/20 text-[#E2FF6F] font-bold text-sm hover:bg-[#E2FF6F]/20 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default function CommunityPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const userRoles = session?.user?.roles;

  const [activeTab, setActiveTab] = useState<'forYou' | 'latest' | 'trending' | 'saved'>('forYou');
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ posts: Post[]; users: any[] } | null>(null);
  const [searching, setSearching] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (tab: string, cursorVal?: string | null) => {
    try {
      if (!cursorVal) setLoading(true);
      setError(null);

      let endpoint = '/api/community/posts?limit=20';
      if (tab === 'forYou') endpoint = '/api/community/feed?limit=20';
      else if (tab === 'trending') endpoint = '/api/community/trending?limit=20';
      else if (tab === 'saved') endpoint = '/api/community/saved?limit=20';

      if (cursorVal) endpoint += `&cursor=${cursorVal}`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      const newPosts: Post[] = data.data || [];

      if (cursorVal) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      setCursor(data.nextCursor || null);
      setHasMore(data.hasMore || false);
    } catch (err) {
      setError('Could not load community feed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    fetchPosts(activeTab, cursor);
  }, [activeTab, cursor, hasMore, loadingMore, fetchPosts]);

  useEffect(() => {
    fetchPosts(activeTab);
    fetch('/api/community/stats')
      .then((r) => r.ok && r.json())
      .then((d) => d && setStats(d))
      .catch(() => toast.error('Failed to load community stats'));
    if (userId) {
      fetch('/api/community/notifications')
        .then((r) => r.ok && r.json())
        .then((d) => {
          if (d) {
            setNotifications(d.notifications || []);
            setUnreadCount(d.unreadCount || 0);
          }
        })
        .catch(() => toast.error('Failed to load notifications'));
    }
  }, [activeTab, userId, fetchPosts]);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/community/search?q=${encodeURIComponent(q)}&type=all&limit=10`);
      if (res.ok) setSearchResults(await res.json());
    } catch {
      setSearchResults(null);
    }
    setSearching(false);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => handleSearch(searchQuery.trim()), 400);
    } else {
      setSearchResults(null);
    }
  }, [searchQuery, handleSearch]);

  const handleReaction = async (postId: string, emoji: string) => {
    if (!userId) return;
    const prev = [...posts];
    setPosts((p) =>
      p.map((post) => {
        if (post._id !== postId) return post;
        const wasLiked = post.isLiked;
        const wasEmoji = post.userReaction;
        return {
          ...post,
          isLiked: wasLiked && wasEmoji === emoji ? false : true,
          userReaction: wasLiked && wasEmoji === emoji ? null : emoji,
          stats: {
            ...post.stats,
            likes:
              wasLiked && wasEmoji === emoji
                ? post.stats.likes - 1
                : post.stats.likes + (wasLiked ? 0 : 1),
          },
        };
      })
    );
    try {
      const res = await fetch('/api/community/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'post', targetId: postId, emoji }),
      });
      if (!res.ok) {
        setPosts(prev);
        toast.error('Failed to add reaction');
      }
    } catch {
      setPosts(prev);
      toast.error('Failed to add reaction');
    }
  };

  const handleSave = async (postId: string) => {
    if (!userId) return;
    const prev = [...posts];
    const wasSaved = posts.find((p) => p._id === postId)?.isSaved;
    setPosts((p) =>
      p.map((post) =>
        post._id === postId
          ? {
              ...post,
              isSaved: !post.isSaved,
              stats: {
                ...post.stats,
                saves: post.isSaved ? post.stats.saves - 1 : post.stats.saves + 1,
              },
            }
          : post
      )
    );
    try {
      const res = await fetch('/api/community/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      if (!res.ok) {
        setPosts(prev);
        toast.error('Failed to save post');
      }
    } catch {
      setPosts(prev);
      toast.error('Failed to save post');
    }
  };

  const handleReport = async (postId: string) => {
    if (!userId) return;
    const reason = prompt('Please describe why you are reporting this content:');
    if (!reason) return;
    try {
      const res = await fetch('/api/community/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'post', targetId: postId, reason }),
      });
      if (res.ok) toast.success("Report submitted. We'll review it.");
      else toast.error('Failed to submit report');
    } catch {
      toast.error('Failed to submit report');
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Post deleted');
        setPosts((p) => p.filter((post) => post._id !== postId));
        setDeleteConfirm(null);
      }
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleMarkNotificationsRead = async () => {
    await fetch('/api/community/notifications', { method: 'PATCH' });
    setUnreadCount(0);
    setNotifications((n) => n.map((notif) => ({ ...notif, read: true })));
  };

  const handleFollow = async (targetUserId: string) => {
    if (!userId) return;
    try {
      const res = await fetch('/api/community/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId }),
      });
      if (res.ok) toast.success('Followed user');
      else toast.error('Failed to follow user');
    } catch {
      toast.error('Failed to follow user');
    }
  };

  const TAB_ITEMS = [
    { id: 'forYou' as const, label: 'For You', icon: Sparkles },
    { id: 'latest' as const, label: 'Latest', icon: Clock },
    { id: 'trending' as const, label: 'Trending', icon: TrendingUp },
    { id: 'saved' as const, label: 'Saved', icon: Bookmark },
  ];

  return (
    <div className="relative font-nunito bg-[#0A0C0B] text-white selection:bg-[#E2FF6F] selection:text-black min-h-screen pb-24">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E2FF6F]/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#c8b6ff]/5 blur-[150px] rounded-full" />
      </div>

      <main
        id="main-content"
        className="relative z-10 pt-6 px-4 md:px-8 lg:px-16 max-w-6xl mx-auto"
      >
        <header className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E2FF6F]/10 border border-[#E2FF6F]/20">
                <ShieldCheck className="w-3 h-3 text-[#E2FF6F]" />
                <span className="text-[10px] font-bold text-[#E2FF6F] tracking-wider uppercase">
                  Safe Space
                </span>
              </div>
              <span className="text-[10px] text-white/30">|</span>
              <span className="text-[10px] text-white/40">Peer Support Network</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Community</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) handleMarkNotificationsRead();
                }}
                className="relative p-2.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <Bell className="w-5 h-5 text-white/60" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-rose-500 text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-12 w-80 bg-[#141716] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="p-3 border-b border-white/5 flex items-center justify-between">
                      <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkNotificationsRead}
                          className="text-[10px] text-[#E2FF6F] font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-white/30 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 20).map((n) => (
                        <div
                          key={n._id}
                          className={cn(
                            'flex items-start gap-3 p-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors',
                            !n.read && 'bg-[#E2FF6F]/[0.02]'
                          )}
                        >
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs shrink-0">
                            {n.sourceUser?.name?.charAt(0) || '?'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-white/80 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-white/30 mt-0.5">
                              {timeAgo(n.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button
              onClick={() => {
                if (!userId) return;
                setShowCreateModal(true);
              }}
              className="bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold rounded-full px-5 h-[42px] shadow-lg shadow-[#E2FF6F]/20 text-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" /> New Post
            </Button>
          </div>
        </header>

        <div className="mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search discussions, topics, or people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] outline-none rounded-full py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/25 focus:border-[#E2FF6F]/40 transition-colors h-[44px]"
            />
            {searching && (
              <Loader2 className="w-4 h-4 animate-spin absolute right-4 top-1/2 -translate-y-1/2 text-[#E2FF6F]" />
            )}
          </div>
          {searchResults && searchQuery.trim() && (
            <div className="mt-2 rounded-2xl border border-white/10 bg-[#141716] p-3 shadow-xl max-h-80 overflow-y-auto">
              {searchResults.posts.length === 0 && searchResults.users.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-4">No results found</p>
              ) : (
                <>
                  {searchResults.users.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-2 mb-1.5">
                        People
                      </p>
                      {searchResults.users.map((u: any) => (
                        <div
                          key={u._id}
                          className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">
                            {u.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{u.name}</p>
                            <p className="text-[10px] text-white/40">@{u.username}</p>
                          </div>
                          {userId && u._id !== userId && (
                            <button
                              onClick={() => handleFollow(u._id)}
                              className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors"
                            >
                              Follow
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.posts.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-2 mb-1.5">
                        Posts
                      </p>
                      {searchResults.posts.slice(0, 5).map((p: any) => (
                        <button
                          key={p._id}
                          onClick={() => {
                            setSelectedPostId(p._id);
                            setSearchQuery('');
                            setSearchResults(null);
                          }}
                          className="w-full text-left flex items-start gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 text-white/20 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white/80 truncate">{p.title}</p>
                            <p className="text-[10px] text-white/40">
                              {p.author?.name || 'Anonymous'} · {p.stats?.likes || 0} reactions
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats ? (
            <>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                <div className="text-2xl font-bold text-white tabular-nums">
                  {formatCount(stats.totalMembers)}
                </div>
                <div className="text-[10px] text-[#E2FF6F] font-bold uppercase tracking-widest">
                  Total Members
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                <div className="text-2xl font-bold text-white tabular-nums">{stats.activeNow}</div>
                <div className="text-[10px] text-[#E2FF6F] font-bold uppercase tracking-widest">
                  Active Now
                </div>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                <div className="text-2xl font-bold text-white tabular-nums">
                  {formatCount(stats.totalDiscussions)}
                </div>
                <div className="text-[10px] text-[#E2FF6F] font-bold uppercase tracking-widest">
                  Discussions
                </div>
              </div>
            </>
          ) : (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 animate-pulse text-center"
              >
                <div className="h-7 w-16 bg-white/10 rounded mx-auto mb-1" />
                <div className="h-3 w-20 bg-white/5 rounded mx-auto" />
              </div>
            ))
          )}
        </section>

        <div className="flex items-center gap-1 mb-6 border-b border-white/[0.06] overflow-x-auto">
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 pb-3 pt-1 px-4 text-sm font-bold transition-all relative whitespace-nowrap',
                  isActive ? 'text-[#E2FF6F]' : 'text-white/40 hover:text-white/70'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E2FF6F]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-6">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <p className="text-sm text-rose-300 flex-1">{error}</p>
            <button
              onClick={() => fetchPosts(activeTab)}
              className="text-xs font-bold text-rose-300 hover:text-rose-200"
            >
              Retry
            </button>
          </div>
        )}

        <div className="space-y-4" ref={feedRef}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonPost key={i} />)
          ) : posts.length === 0 ? (
            <EmptyState
              icon={activeTab === 'saved' ? Bookmark : MessageSquare}
              title={activeTab === 'saved' ? 'No saved posts' : 'No discussions yet'}
              description={
                activeTab === 'saved'
                  ? 'Save posts to read them later'
                  : 'Be the first to start a conversation.'
              }
              action={
                activeTab !== 'saved'
                  ? { label: 'Create Post', onClick: () => setShowCreateModal(true) }
                  : undefined
              }
            />
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {posts.map((post) => (
                  <motion.div
                    key={post._id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-5 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {post.isAnonymous ? (
                          <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0 border border-white/10">
                            <Users className="w-4 h-4 text-white/30" />
                          </div>
                        ) : post.author ? (
                          <button
                            onClick={() => setSelectedPostId(post._id)}
                            className="w-9 h-9 rounded-full bg-[#E2FF6F]/10 flex items-center justify-center text-sm font-bold text-[#E2FF6F] shrink-0 border border-[#E2FF6F]/20 overflow-hidden"
                          >
                            {post.author.image ? (
                              <img
                                src={post.author.image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              post.author.name?.charAt(0) || '?'
                            )}
                          </button>
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs shrink-0">
                            ?
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white truncate">
                              {post.isAnonymous ? 'Anonymous' : post.author?.name || 'Unknown'}
                            </span>
                            {post.author?.roles?.includes('admin') && !post.isAnonymous && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-white/40">{timeAgo(post.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={cn(
                            'text-[9px] font-bold px-2 py-0.5 rounded-full border',
                            getTypeColor(post.type)
                          )}
                        >
                          {post.type}
                        </span>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(deleteConfirm === post._id ? null : post._id);
                            }}
                            className="p-1 rounded-lg hover:bg-white/5 text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {deleteConfirm === post._id && (
                            <div className="absolute right-0 top-8 w-36 bg-[#141716] border border-white/10 rounded-xl shadow-2xl z-20 py-1">
                              {userId === post.author?._id && (
                                <button
                                  onClick={() => handleDelete(post._id)}
                                  className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  handleReport(post._id);
                                  setDeleteConfirm(null);
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-white/60 hover:bg-white/5 flex items-center gap-2"
                              >
                                <Flag className="w-3.5 h-3.5" /> Report
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPostId(post._id)}
                      className="w-full text-left"
                    >
                      <h3 className="text-base font-bold text-white mb-1.5 leading-snug pr-4">
                        {post.title}
                      </h3>
                      <p className="text-sm text-white/50 leading-relaxed line-clamp-3 mb-3">
                        {post.content}
                      </p>
                    </button>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/40 font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                      <div className="flex items-center gap-1">
                        {EMOJI_REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(post._id, emoji)}
                            className={cn(
                              'text-sm px-2 py-1 rounded-lg transition-all hover:bg-white/5',
                              post.userReaction === emoji
                                ? 'bg-white/10 scale-110'
                                : 'opacity-40 hover:opacity-80'
                            )}
                          >
                            {emoji}
                          </button>
                        ))}
                        <span className="text-xs text-white/40 ml-1 tabular-nums">
                          {formatCount(post.stats?.likes || 0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedPostId(post._id)}
                          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {post.stats?.comments || 0}
                        </button>
                        <button
                          onClick={() => handleSave(post._id)}
                          className={cn(
                            'p-1 rounded-lg transition-colors',
                            post.isSaved ? 'text-[#E2FF6F]' : 'text-white/30 hover:text-white/60'
                          )}
                        >
                          <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-[#E2FF6F]' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {hasMore && (
                <div className="flex justify-center pt-2 pb-8">
                  <Button
                    onClick={loadMore}
                    disabled={loadingMore}
                    variant="outline"
                    className="rounded-full border-white/[0.08] hover:bg-white/5 text-white/60 text-sm px-8"
                  >
                    {loadingMore ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {loadingMore ? 'Loading...' : `Load More (${posts.length}+)`}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePostModal
            userId={userId}
            onClose={() => setShowCreateModal(false)}
            onCreated={(post) => {
              setPosts((prev) => [post, ...prev]);
              setShowCreateModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPostId && (
          <PostDetailModal
            postId={selectedPostId}
            userId={userId}
            userRoles={userRoles}
            userName={session?.user?.name || ''}
            onClose={() => setSelectedPostId(null)}
            onDelete={(id) => {
              setPosts((p) => p.filter((po) => po._id !== id));
              setSelectedPostId(null);
            }}
            onReact={(postId, emoji) => handleReaction(postId, emoji)}
            onSave={(postId) => handleSave(postId)}
          />
        )}
      </AnimatePresence>

      {/* Infinite Scroll */}
      <InfiniteScrollTrigger onLoadMore={loadMore} hasMore={hasMore} loading={loadingMore} />
    </div>
  );
}

function InfiniteScrollTrigger({
  onLoadMore,
  hasMore,
  loading,
}: {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (!hasMore) return null;
  return <div ref={sentinelRef} className="h-4" />;
}

function CreatePostModal({
  userId,
  onClose,
  onCreated,
}: {
  userId?: string;
  onClose: () => void;
  onCreated: (post: Post) => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<string>('discussion');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !userId) return;
    setSubmitting(true);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          type,
          isAnonymous,
          tags,
          language: 'en',
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const post = await res.json();
      toast.success('Post published!');
      onCreated(post);
    } catch {
      toast.error('Failed to create post. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[#0A0C0B] border border-white/[0.08] rounded-[24px] shadow-2xl relative overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#E2FF6F]" /> New Discussion
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">
              Post Type
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {['discussion', 'support', 'achievement', 'question', 'resource'].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    'text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all capitalize',
                    type === t
                      ? 'bg-[#E2FF6F]/10 border-[#E2FF6F]/30 text-[#E2FF6F]'
                      : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">
              Title
            </label>
            <input
              type="text"
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E2FF6F]/40 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">
              Content
            </label>
            <textarea
              placeholder="Share your thoughts, experience, or question..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={10000}
              className="w-full min-h-[120px] p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E2FF6F]/40 resize-none transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. anxiety, meditation, sleep"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E2FF6F]/40 transition-colors"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={cn(
                'w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all',
                isAnonymous ? 'bg-[#E2FF6F] border-[#E2FF6F]' : 'border-white/20'
              )}
            >
              {isAnonymous && <Check className="w-3 h-3 text-black" />}
            </div>
            <span className="text-sm text-white/60">Post anonymously</span>
          </label>
        </div>
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-[10px] text-white/30">{content.length}/10000</span>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || submitting || !userId}
            className="bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold rounded-full h-11 px-6 gap-2 disabled:bg-white/[0.04] disabled:text-white/30 shadow-lg shadow-[#E2FF6F]/20 text-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Publish
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PostDetailModal({
  postId,
  userId,
  userRoles,
  userName,
  onClose,
  onDelete,
  onReact,
  onSave,
}: {
  postId: string;
  userId?: string;
  userRoles?: string[];
  userName?: string;
  onClose: () => void;
  onDelete: (id: string) => void;
  onReact: (postId: string, emoji: string) => void;
  onSave: (postId: string) => void;
}) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [commentAnonymous, setCommentAnonymous] = useState(false);

  useEffect(() => {
    fetch(`/api/community/posts/${postId}`)
      .then((r) => r.ok && r.json())
      .then((d) => {
        if (d) {
          setPost(d.post);
          setComments(d.comments || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [postId]);

  const handleComment = async () => {
    if (!commentText.trim() || !userId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText.trim(),
          parentComment: replyTo,
          isAnonymous: commentAnonymous,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const newComment = await res.json();
      if (replyTo) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === replyTo ? { ...c, replies: [...(c.replies || []), newComment] } : c
          )
        );
      } else {
        setComments((prev) => [...prev, newComment]);
      }
      toast.success('Comment posted!');
      setCommentText('');
      setReplyTo(null);
      if (post) setPost({ ...post, stats: { ...post.stats, comments: post.stats.comments + 1 } });
    } catch {
      toast.error('Failed to post comment');
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/community/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        if (post)
          setPost({
            ...post,
            stats: { ...post.stats, comments: Math.max(0, post.stats.comments - 1) },
          });
      }
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 md:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-[#0A0C0B] border border-white/[0.08] rounded-[24px] shadow-2xl relative flex flex-col max-h-[90vh]"
      >
        <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-sm font-bold text-white">Discussion</h2>
          <div className="w-16" />
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            <SkeletonPost />
            <SkeletonPost />
          </div>
        ) : !post ? (
          <div className="p-12 text-center text-white/40">Post not found</div>
        ) : (
          <>
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#E2FF6F]/10 flex items-center justify-center text-sm font-bold text-[#E2FF6F] shrink-0 border border-[#E2FF6F]/20 overflow-hidden">
                  {post.isAnonymous ? (
                    <Users className="w-5 h-5 text-white/30" />
                  ) : post.author?.image ? (
                    <img src={post.author.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    post.author?.name?.charAt(0) || '?'
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {post.isAnonymous ? 'Anonymous' : post.author?.name || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40">{timeAgo(post.createdAt)}</p>
                </div>
                <span
                  className={cn(
                    'text-[9px] font-bold px-2 py-0.5 rounded-full border capitalize',
                    getTypeColor(post.type)
                  )}
                >
                  {post.type}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white leading-snug">{post.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/40"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 border-t border-white/[0.06] pt-4">
                {EMOJI_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onReact(post._id, emoji)}
                    className={cn(
                      'text-base px-2.5 py-1.5 rounded-xl transition-all hover:bg-white/5',
                      post.userReaction === emoji
                        ? 'bg-white/10 ring-1 ring-white/20'
                        : 'opacity-40 hover:opacity-80'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
                <span className="text-xs text-white/40 ml-1">
                  {formatCount(post.stats?.likes || 0)}
                </span>
                <div className="flex-1" />
                <button
                  onClick={() => onSave(post._id)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    post.isSaved ? 'text-[#E2FF6F]' : 'text-white/30 hover:text-white/60'
                  )}
                >
                  <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-[#E2FF6F]' : ''}`} />
                </button>
                {userId === post.author?._id && (
                  <button
                    onClick={() => {
                      onDelete(post._id);
                      onClose();
                    }}
                    className="p-2 rounded-lg text-white/30 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="border-t border-white/[0.06] pt-4 space-y-3">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider">
                  {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                </h4>

                {comments.length === 0 && (
                  <p className="text-sm text-white/30 text-center py-4">
                    No comments yet. Be the first to respond.
                  </p>
                )}

                {comments.map((comment) => (
                  <div key={comment._id}>
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {comment.isAnonymous ? (
                          <Users className="w-3.5 h-3.5 text-white/30" />
                        ) : (
                          comment.author?.name?.charAt(0) || '?'
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-white">
                            {comment.isAnonymous ? 'Anonymous' : comment.author?.name || 'Unknown'}
                          </span>
                          <span className="text-[10px] text-white/30">
                            {timeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">{comment.content}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <button
                            onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                            className="text-[10px] text-white/40 hover:text-white/70 font-medium transition-colors"
                          >
                            {replyTo === comment._id ? 'Cancel' : 'Reply'}
                          </button>
                          {(userId === comment.author?._id || userRoles?.includes('admin')) && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-[10px] text-white/30 hover:text-rose-400 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    {comment.replies?.map((reply) => (
                      <div
                        key={reply._id}
                        className="flex items-start gap-2.5 ml-8 mt-1.5 p-2.5 rounded-xl bg-white/[0.015] border border-white/[0.03]"
                      >
                        <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[9px] font-bold shrink-0">
                          {reply.isAnonymous ? (
                            <Users className="w-3 h-3 text-white/30" />
                          ) : (
                            reply.author?.name?.charAt(0) || '?'
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-bold text-white">
                              {reply.isAnonymous ? 'Anonymous' : reply.author?.name || 'Unknown'}
                            </span>
                            <span className="text-[9px] text-white/30">
                              {timeAgo(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-white/50 leading-relaxed">{reply.content}</p>
                          {(userId === reply.author?._id || userRoles?.includes('admin')) && (
                            <button
                              onClick={() => handleDeleteComment(reply._id)}
                              className="text-[10px] text-white/30 hover:text-rose-400 transition-colors mt-0.5"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {userId && (
              <div className="p-4 border-t border-white/[0.08] shrink-0">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E2FF6F]/10 flex items-center justify-center text-xs font-bold text-[#E2FF6F] shrink-0">
                    {userName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <textarea
                      placeholder={replyTo ? 'Write a reply...' : 'Share your thoughts...'}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      maxLength={5000}
                      className="w-full min-h-[60px] bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E2FF6F]/40 resize-none transition-colors"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={commentAnonymous}
                          onChange={() => setCommentAnonymous(!commentAnonymous)}
                          className="sr-only"
                        />
                        <div
                          className={cn(
                            'w-4 h-4 rounded border-2 flex items-center justify-center',
                            commentAnonymous ? 'bg-[#E2FF6F] border-[#E2FF6F]' : 'border-white/20'
                          )}
                        >
                          {commentAnonymous && <Check className="w-2.5 h-2.5 text-black" />}
                        </div>
                        <span className="text-[10px] text-white/40">Anonymous</span>
                      </label>
                      <Button
                        onClick={handleComment}
                        disabled={!commentText.trim() || submitting}
                        size="sm"
                        className="bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold rounded-full h-8 px-4 text-xs gap-1.5 disabled:bg-white/[0.04] disabled:text-white/30"
                      >
                        {submitting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                        {replyTo ? 'Reply' : 'Comment'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

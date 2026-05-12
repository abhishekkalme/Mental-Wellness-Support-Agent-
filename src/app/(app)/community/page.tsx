'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Group {
  _id: string;
  name: string;
  members: number;
  active: number;
  category: string;
  icon?: string;
  joined: boolean;
  host?: string;
  tags?: string[];
  participants?: { image?: string; name: string }[];
}

export interface Post {
  _id: string;
  user: string;
  userImage?: string;
  time: string | Date;
  content: string;
  likes: number;
  comments: number;
  liked: boolean;
  saved: boolean;
  topic?: string;
}

export interface CommunityStats {
  totalMembers: number;
  activeNow: number;
  totalDiscussions: number;
}

const SkeletonLoader = ({ type }: { type: 'group' | 'post' | 'stat' }) => {
  if (type === 'stat') {
    return (
      <div className="px-8 pt-4 md:pt-0 animate-pulse flex flex-col items-center">
        <div className="h-10 w-24 bg-white/10 rounded mb-2"></div>
        <div className="h-4 w-32 bg-[#E2FF6F]/20 rounded"></div>
      </div>
    );
  }
  return (
    <div className="glass-panel p-6 border border-white/5 bg-white/5 animate-pulse min-h-[160px] rounded-[24px]">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-white/10 shrink-0"></div>
        <div className="space-y-3 flex-1">
          <div className="h-4 w-3/4 bg-white/10 rounded"></div>
          <div className="h-3 w-1/2 bg-white/10 rounded"></div>
          <div className="h-20 w-full bg-white/5 rounded mt-4"></div>
        </div>
      </div>
    </div>
  );
};

const renderEmptyState = (message: string, subMessage: string) => (
  <div className="glass-panel p-12 flex flex-col items-center justify-center text-center bg-white/5 border border-white/5 rounded-[32px]">
    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
      <Database className="w-8 h-8 text-white/20" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{message}</h3>
    <p className="text-white/40 text-sm max-w-sm">{subMessage}</p>
  </div>
);

export default function CommunityPage() {
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<'Explore' | 'Joined'>('Explore');
  const [groups, setGroups] = useState<Group[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<CommunityStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTopic, setNewPostTopic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Core Data Fetching
  const fetchCommunityData = useCallback(async (query: string = '') => {
    try {
      const q = query ? `?q=${encodeURIComponent(query)}` : '';
      const [groupsRes, postsRes, statsRes] = await Promise.all([
        fetch(`/api/community/groups${q}`),
        fetch(`/api/community/posts${q}`),
        fetch(`/api/community/stats`),
      ]);

      if (!groupsRes.ok || !postsRes.ok) throw new Error('API Sync Failed');

      const [groupsData, postsData, statsData] = await Promise.all([
        groupsRes.json(),
        postsRes.json(),
        statsRes.ok ? statsRes.json() : null,
      ]);

      const deduplicatedGroups = Array.isArray(groupsData) 
        ? Array.from(new Map(groupsData.map((g: Group) => [g.name, g])).values()) as Group[]
        : [];
      
      const deduplicatedPosts = Array.isArray(postsData)
        ? Array.from(new Map(postsData.map((p: Post) => [p.content, p])).values()) as Post[]
        : [];

      setGroups(deduplicatedGroups);
      setPosts(deduplicatedPosts);
      if (statsData) setStats(statsData);
    } catch (err: unknown) {
      console.error('Community Fetch Error:', err);
      setError('Connection to community network was disrupted. Retrying...');
    }
  }, []);

  // Initial Load
  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchCommunityData();
      setLoading(false);
    })();
  }, [fetchCommunityData]);

  // Backend-Driven Debounced Search
  useEffect(() => {
    if (searchLoading) return; // Prevent loop on initial load

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (searchQuery.trim().length > 0) {
      setSearchLoading(true);
      searchTimeoutRef.current = setTimeout(async () => {
        await fetchCommunityData(searchQuery.trim());
        setSearchLoading(false);
      }, 600); // 600ms debounce
    } else if (searchQuery === '' && !loading) {
      // Re-fetch base data when search is cleared
      setSearchLoading(true);
      fetchCommunityData('').then(() => setSearchLoading(false));
    }
  }, [searchQuery, fetchCommunityData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Actions
  const handleAction = async (
    endpoint: string,
    method: string,
    payload: any,
    optimisticUpdate: () => void,
    rollback: () => void
  ) => {
    if (!session?.user) {
      alert('Authentication required. Please sign in to interact.');
      return;
    }

    optimisticUpdate();

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Action failed');
    } catch (err) {
      rollback();
      console.error(err);
      alert('We encountered a server error executing your action. Please try again.');
    }
  };

  const handleJoinGroup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const backup = [...groups];
    handleAction(
      '/api/community/groups',
      'PATCH',
      { groupId: id, action: 'toggleJoin' },
      () => setGroups((prev) => prev.map((g) => (g._id === id ? { ...g, joined: !g.joined } : g))),
      () => setGroups(backup)
    );
  };

  const handleLikePost = (id: string) => {
    const backup = [...posts];
    handleAction(
      '/api/community/posts',
      'PATCH',
      { postId: id, action: 'toggleLike' },
      () =>
        setPosts((prev) =>
          prev.map((p) =>
            p._id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p
          )
        ),
      () => setPosts(backup)
    );
  };

  const handleSavePost = (id: string) => {
    const backup = [...posts];
    handleAction(
      '/api/community/posts/save',
      'POST',
      { postId: id },
      () => setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, saved: !p.saved } : p))),
      () => setPosts(backup)
    );
  };

  const handleReportPost = (id: string) => {
    if (!session?.user) return alert('Authentication required to report.');
    if (confirm('Are you sure you want to flag this content for review?')) {
      fetch('/api/community/posts/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id }),
      }).then(() => alert('Content has been flagged for moderation review.'));
    }
  };

  const handleComment = (id: string) => {
    if (!session?.user) return alert('Authentication required to comment.');
    alert(
      'Comment thread modal would open here connected to /api/community/posts/' + id + '/comments'
    );
  };

  const handleToggleNotifications = () => {
    if (!session?.user) return alert('Authentication required.');
    alert('Push notifications preference updated for your device.');
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !newPostTopic.trim() || !session?.user) return;

    setIsSubmitting(true);
    const postPayload = {
      topic: newPostTopic,
      content: newPostContent,
    };

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postPayload),
      });

      if (!res.ok) throw new Error('Failed to create post');

      const savedPost = await res.json();
      setPosts((prev) => [savedPost, ...prev]);
      setNewPostContent('');
      setNewPostTopic('');
      setShowCreateModal(false);
    } catch (err: unknown) {
      console.error('Create post error', err);
      alert('Failed to publish discussion to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render components
  const formatTime = (timeInfo: string | Date) => {
    try {
      const date = new Date(timeInfo);
      if (isNaN(date.getTime())) return String(timeInfo);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return String(timeInfo);
    }
  };

  const activeRooms = activeTab === 'Explore' ? groups : groups.filter((g) => g.joined);

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center font-nunito bg-black text-white p-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4">Service Unavailable</h2>
        <p className="text-white/60 text-center max-w-md bg-white/5 p-6 rounded-2xl border border-white/10 mb-8">
          {error}
        </p>
        <Button
          onClick={() => fetchCommunityData('')}
          className="bg-[#E2FF6F] text-black font-bold h-12 px-8 rounded-full"
        >
          Retry Server Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="relative font-nunito bg-black text-white selection:bg-[#E2FF6F] selection:text-black min-h-screen pb-24">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E2FF6F]/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#c8b6ff]/5 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 pt-10 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto space-y-16">
        {/* Header / Hero Area */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#E2FF6F]/20 rounded-full bg-[#E2FF6F]/5 text-[#E2FF6F] font-bold text-xs tracking-widest uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Network</span>
              </div>
              <button
                onClick={handleToggleNotifications}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white relative"
              >
                <Bell className="w-5 h-5" />
              </button>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">Community Hub</h1>
            <p className="text-white/50 text-lg max-w-md font-medium leading-relaxed">
              Connect with individuals navigating similar paths. Find support, share, and heal
              together.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search server records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 outline-none rounded-full py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-[#E2FF6F]/50 transition-colors h-[48px]"
              />
              {searchLoading && (
                <Loader2 className="w-4 h-4 animate-spin absolute right-4 top-1/2 -translate-y-1/2 text-[#E2FF6F]" />
              )}
            </div>
            <Button
              onClick={() => {
                if (!session?.user) return alert('Must be signed in to start a discussion.');
                setShowCreateModal(true);
              }}
              className="bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold rounded-full px-6 h-[48px] shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" /> Start Discussion
            </Button>
          </div>
        </header>

        {/* Dynamic Global Stats */}
        <section className="glass-panel border border-white/10 bg-white/5 backdrop-blur-md py-8 px-6 rounded-[32px]">
          <div className="flex flex-col md:flex-row justify-around gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            {loading ? (
              <>
                <SkeletonLoader type="stat" />
                <SkeletonLoader type="stat" />
                <SkeletonLoader type="stat" />
              </>
            ) : stats ? (
              <>
                <div className="px-8 pt-4 md:pt-0">
                  <div className="text-4xl font-bold text-white tracking-tight mb-1">
                    {stats.totalMembers?.toLocaleString() || 0}
                  </div>
                  <div className="text-[#E2FF6F] text-xs uppercase font-bold tracking-widest">
                    Total Members
                  </div>
                </div>
                <div className="px-8 pt-4 md:pt-0">
                  <div className="text-4xl font-bold text-white tracking-tight mb-1">
                    {stats.activeNow?.toLocaleString() || 0}
                  </div>
                  <div className="text-[#E2FF6F] text-xs uppercase font-bold tracking-widest">
                    Active Now
                  </div>
                </div>
                <div className="px-8 pt-4 md:pt-0">
                  <div className="text-4xl font-bold text-white tracking-tight mb-1">
                    {stats.totalDiscussions?.toLocaleString() || 0}
                  </div>
                  <div className="text-[#E2FF6F] text-xs uppercase font-bold tracking-widest">
                    Discussions
                  </div>
                </div>
              </>
            ) : (
              <div className="text-white/40text-sm w-full font-medium">
                Server statistics unavailable.
              </div>
            )}
          </div>
        </section>

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Active Groups & Rooms */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-6 border-b border-white/10">
              {['Explore', 'Joined'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'Explore' | 'Joined')}
                  className={`pb-4 text-base font-bold transition-all relative ${
                    activeTab === tab ? 'text-[#E2FF6F]' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="group-tab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E2FF6F]"
                    />
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((idx) => (
                  <SkeletonLoader key={idx} type="group" />
                ))}
              </div>
            ) : activeRooms.length === 0 ? (
              renderEmptyState(
                'No groups located via server.',
                searchQuery
                  ? 'Network search returned 0 matches.'
                  : 'Be the first to create a community node.'
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {activeRooms.map((room) => (
                    <motion.div
                      key={room._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass-panel p-6 border border-white/10 hover:border-[#E2FF6F]/30 hover:bg-white/10 transition-all cursor-pointer flex flex-col justify-between bg-white/5"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="text-2xl bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center border border-white/5">
                            {room.icon || '📌'}
                          </div>
                          {room.active > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-bold uppercase tracking-widest bg-black/20 px-2 py-1 rounded">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              {room.active} Live
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 items-center mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-white/5 text-white/60">
                            {room.category || 'General'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1.5 leading-snug">
                          {room.name}
                        </h3>
                        <p className="text-white/40 text-xs mb-6 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> {room.members} members
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                        <div className="flex -space-x-2">
                          {room.participants && room.participants.length > 0 ? (
                            room.participants
                              .slice(0, 3)
                              .map((participant, idx) => (
                                <img
                                  key={idx}
                                  src={participant.image || '/default-avatar.png'}
                                  alt={participant.name}
                                  className="w-7 h-7 rounded-full bg-black border border-white/20 object-cover"
                                />
                              ))
                          ) : (
                            <span className="text-white/30 text-[10px] uppercase font-bold">
                              Open Public
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={(e) => handleJoinGroup(room._id, e)}
                          size="sm"
                          className={`rounded-full font-bold text-xs h-8 px-4 transition-colors ${
                            room.joined
                              ? 'bg-[#E2FF6F] text-black hover:bg-red-500 hover:text-white border-transparent'
                              : 'bg-transparent border border-white/20 text-white hover:bg-white/10'
                          }`}
                        >
                          {room.joined ? 'Leave' : 'Join'}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right Column - Discussions Feed */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#E2FF6F]" /> Network Feed
              </h2>
            </div>

            {loading ? (
              <div className="space-y-4">
                <SkeletonLoader type="post" />
                <SkeletonLoader type="post" />
                <SkeletonLoader type="post" />
              </div>
            ) : posts.length === 0 ? (
              renderEmptyState(
                'No discussions yet.',
                'Be the first to start a conversation across the network.'
              )
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {posts.map((post) => (
                    <motion.div
                      key={post._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-panel p-5 bg-white/5 border border-white/10 rounded-[24px] group transition-all hover:bg-white/10"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          {post.userImage ? (
                            <img
                              src={post.userImage}
                              alt={post.user}
                              className="w-8 h-8 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs text-white uppercase font-bold">
                              {post.user.charAt(0) || '?'}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-white">{post.user}</p>
                            <p className="text-[10px] text-white/40">{formatTime(post.time)}</p>
                          </div>
                        </div>

                        <div className="relative group/menu">
                          <button className="text-white/40 hover:text-white p-1 rounded transition-colors hidden group-hover:block">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {/* Mock dropdown UI for demonstration of Moderation states */}
                          <div className="absolute right-0 top-full mt-1 w-32 bg-[#1A1D1B] border border-white/10 rounded-xl shadow-2xl py-1 opacity-0 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:pointer-events-auto transition-all z-10 flex flex-col">
                            <button
                              onClick={() => handleReportPost(post._id)}
                              className="text-left px-4 py-2 text-xs text-white/60 hover:text-red-400 hover:bg-white/5 flex items-center gap-2"
                            >
                              <Flag className="w-3 h-3" /> Report
                            </button>
                          </div>
                        </div>
                      </div>

                      {post.topic && (
                        <h4 className="text-white/90 font-bold leading-snug mb-2 group-hover:text-[#E2FF6F] transition-colors pr-4">
                          {post.topic}
                        </h4>
                      )}
                      <p className="text-sm text-white/60 mb-5 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3">
                        <div className="flex gap-4 text-xs font-bold">
                          <button
                            onClick={() => handleLikePost(post._id)}
                            className={`flex items-center gap-1.5 transition-colors ${post.liked ? 'text-rose-500' : 'text-white/40 hover:text-white'}`}
                          >
                            <Heart className={`w-4 h-4 ${post.liked ? 'fill-rose-500' : ''}`} />
                            {post.likes}
                          </button>
                          <button
                            onClick={() => handleComment(post._id)}
                            className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            {post.comments}
                          </button>
                        </div>
                        <button
                          onClick={() => handleSavePost(post._id)}
                          className={`p-1.5 transition-colors rounded hover:bg-white/5 ${post.saved ? 'text-[#E2FF6F]' : 'text-white/40 hover:text-white'}`}
                        >
                          <Bookmark className={`w-4 h-4 ${post.saved ? 'fill-[#E2FF6F]' : ''}`} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Strict Backend-Bound Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-lg bg-[#141716] border border-white/10 rounded-[32px] shadow-2xl relative overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#E2FF6F]" /> Network Transmission
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {!session?.user && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">
                      Session invalidated. You must be actively authenticated by the server to
                      safely transmit requests.
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">
                    System Topic / Title
                  </label>
                  <input
                    type="text"
                    placeholder="Provide context..."
                    value={newPostTopic}
                    onChange={(e) => setNewPostTopic(e.target.value)}
                    disabled={!session?.user || isSubmitting}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#E2FF6F]/50 transition-colors font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">
                    Transmission Body
                  </label>
                  <textarea
                    placeholder="Enter discussion content..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    disabled={!session?.user || isSubmitting}
                    className="w-full min-h-[140px] p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#E2FF6F]/50 resize-none text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="px-8 py-6 bg-white/5 border-t border-white/10 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-none">
                    Identity Key
                  </span>
                  <span className="text-sm text-white font-bold">
                    {session?.user?.name || 'Unauthorized Request'}
                  </span>
                </div>

                <Button
                  onClick={handleCreatePost}
                  disabled={
                    !newPostContent.trim() || !newPostTopic.trim() || !session || isSubmitting
                  }
                  className="bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold rounded-full h-12 px-8 gap-2 disabled:bg-white/10 disabled:text-white/40"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
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
        )}
      </AnimatePresence>
    </div>
  );
}

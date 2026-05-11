'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Users,
  Search,
  MessageSquare,
  Heart,
  ShieldCheck,
  Plus,
  Filter,
  ChevronRight,
  X,
  Send,
  Database,
  Loader2,
} from 'lucide-react';

// Types for dynamic data
interface Group {
  _id?: string;
  id?: string;
  name: string;
  members: string;
  active: string;
  category: string;
  icon: string;
  joined: boolean;
}

interface Post {
  _id?: string;
  id?: string;
  user: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  liked: boolean;
}

const seedGroups = [
  {
    name: 'Anxiety Support',
    members: '1.2k',
    active: '45',
    category: 'Mental Health',
    icon: '🌱',
    joined: true,
  },
  {
    name: 'Study Stress & Burnout',
    members: '850',
    active: '12',
    category: 'Academic',
    icon: '📚',
    joined: false,
  },
  {
    name: 'Loneliness & Connection',
    members: '2.1k',
    active: '120',
    category: 'Social',
    icon: '🤝',
    joined: false,
  },
  {
    name: 'ADHD Strategies',
    members: '640',
    active: '8',
    category: 'Neurodiversity',
    icon: '⚡',
    joined: true,
  },
  {
    name: 'Gratitude Daily',
    members: '3.4k',
    active: '200',
    category: 'Wellness',
    icon: '🙏',
    joined: false,
  },
];

const seedPosts = [
  {
    user: 'Anonymous Panda',
    time: '2h ago',
    content:
      'Had a really rough day today with exam prep, but I managed to finish one chapter. Small wins!',
    likes: 24,
    comments: 5,
    liked: false,
  },
  {
    user: 'Kind Soul',
    time: '4h ago',
    content:
      'Does anyone have tips for winding down after a 10pm lecture? My brain stays wired for hours.',
    likes: 12,
    comments: 18,
    liked: false,
  },
  {
    user: 'Night Owl',
    time: '5h ago',
    content:
      'Just sharing some positive vibes to whoever is reading this. You are doing great, and things will get better. ❤️',
    likes: 89,
    comments: 12,
    liked: true,
  },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('Explore');
  const [groups, setGroups] = useState<Group[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');

  const handleCreateInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetch('/api/community/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(seedGroups),
        }),
        fetch('/api/community/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(seedPosts),
        }),
      ]);
      await fetchData();
    } catch (err: unknown) {
      console.error('Failed to seed data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupsRes, postsRes] = await Promise.all([
        fetch('/api/community/groups'),
        fetch('/api/community/posts'),
      ]);
      const groupsData = await groupsRes.json();
      const postsData = await postsRes.json();
      setGroups(groupsData);
      setPosts(postsData);
    } catch (err: unknown) {
      console.error('Failed to fetch community data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchData();
      if (groups.length === 0 && posts.length === 0) {
        await handleCreateInitialData();
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoinGroup = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, this would be a PATCH request to MongoDB
    setGroups(groups.map((g) => (g._id === id || g.id === id ? { ...g, joined: !g.joined } : g)));
  };

  const handleLikePost = (id: string) => {
    // In a real app, this would be a PATCH request to MongoDB
    setPosts(
      posts.map((p) => {
        if (p._id === id || p.id === id) {
          return { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked };
        }
        return p;
      })
    );
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    const newPost = {
      user: 'Hidden Fox',
      time: 'Just now',
      content: newPostContent,
      likes: 0,
      comments: 0,
      liked: false,
    };

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      const savedPost = await res.json();
      setPosts([savedPost, ...posts]);
      setNewPostContent('');
      setShowCreateModal(false);
      setActiveTab('Recent Threads');
    } catch (err: unknown) {
      console.error('Failed to create post', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">
          Connecting to community...
        </p>
      </div>
    );
  }

  if (groups.length === 0 && posts.length === 0) {
    return (
      <main className="p-8 max-w-7xl mx-auto min-h-[70vh] flex items-center justify-center">
        <div className="glass-panel p-12 text-center flex flex-col items-center gap-6 max-w-md bg-secondary/10 border-sky-400/20">
          <div className="w-20 h-20 rounded-full bg-sky-400/10 flex items-center justify-center">
            <Database className="w-10 h-10 text-sky-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-3">Community Data Not Found</h2>
            <p className="text-muted-foreground">
              The community module is currently empty in our database. Click &quot;Create&quot; to
              initialize the safe space.
            </p>
          </div>
          <Button
            onClick={handleCreateInitialData}
            size="lg"
            className="rounded-xl px-12 h-14 text-lg font-bold shadow-lg shadow-sky-400/20 bg-sky-500 hover:bg-sky-600"
          >
            <Plus className="w-5 h-5 mr-2" /> Create Community
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-10 relative">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sky-400 mb-2">
            <Users className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-widest">Safe Community</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Support Groups</h1>
          <p className="text-muted-foreground text-lg">
            You don&apos;t have to carry the weight alone. Join the conversation.
          </p>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="gap-2 rounded-xl">
            <Filter className="w-4 h-4" /> Filters
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2 rounded-xl">
            <Plus className="w-4 h-4" /> Create Thread
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
              My Joined Groups
            </h3>
            <div className="space-y-2">
              {groups
                .filter((g) => g.joined)
                .map((g) => (
                  <button
                    key={g._id || g.id}
                    className="w-full text-left p-3 rounded-xl hover:bg-secondary/50 transition-all flex items-center gap-3 group"
                  >
                    <span className="text-xl">{g.icon}</span>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                        {g.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{g.active} active now</p>
                    </div>
                  </button>
                ))}
              {groups.filter((g) => g.joined).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  You haven&apos;t joined any groups yet.
                </p>
              )}
            </div>
          </div>

          <div className="glass-panel p-8 bg-sky-400/5 border-sky-400/20 space-y-4">
            <ShieldCheck className="w-8 h-8 text-sky-400" />
            <h3 className="font-bold">Total Anonymity</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your profile is always hidden in community spaces. We use auto-generated aliases to
              keep your identity 100% private.
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between border-b border-border">
            <div className="flex gap-6">
              {['Explore', 'Recent Threads', 'Saved'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="pb-4 relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search community..."
                className="pl-9 pr-4 py-1.5 rounded-full text-sm bg-secondary/50 border-none outline-none focus:ring-1 ring-primary/50"
              />
            </div>
          </div>

          {activeTab === 'Explore' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((g) => (
                <div
                  key={g._id || g.id}
                  className="glass-panel p-6 hover:border-sky-400/30 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-4xl">{g.icon}</div>
                      <span className="text-[10px] font-bold text-sky-400 bg-sky-400/10 px-2 py-1 rounded-md uppercase tracking-widest">
                        {g.category}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold group-hover:text-sky-400 transition-colors">
                      {g.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      {g.members} members helping each other.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full border-2 border-background bg-secondary"
                        />
                      ))}
                      <div className="text-[9px] font-bold pl-4 text-muted-foreground">
                        +{parseInt(g.members) - 3} more
                      </div>
                    </div>
                    <Button
                      onClick={(e) => handleJoinGroup((g._id || g.id)!, e)}
                      size="sm"
                      variant={g.joined ? 'primary' : 'ghost'}
                      className="text-xs font-bold gap-1"
                    >
                      {g.joined ? 'Joined' : 'Join Group'} <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Recent Threads' && (
            <div className="space-y-4">
              {posts.map((p) => (
                <div
                  key={p._id || p.id}
                  className="glass-panel p-8 space-y-6 hover:border-border transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                        {p.user === 'Anonymous Panda'
                          ? '🐼'
                          : p.user === 'Hidden Fox'
                            ? '🦊'
                            : '🦋'}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{p.user}</p>
                        <p className="text-[10px] text-muted-foreground">{p.time}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                    {p.content}
                  </p>
                  <div className="flex items-center gap-6 pt-2">
                    <button
                      onClick={() => handleLikePost((p._id || p.id)!)}
                      className={`flex items-center gap-2 text-xs font-bold transition-colors ${p.liked ? 'text-rose-500' : 'text-muted-foreground hover:text-primary'}`}
                    >
                      <Heart className={`w-4 h-4 ${p.liked ? 'fill-rose-500' : ''}`} /> {p.likes}{' '}
                      Likes
                    </button>
                    <button className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                      <MessageSquare className="w-4 h-4" /> {p.comments} Comments
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Saved' && (
            <div className="glass-panel p-12 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">No Saved Threads</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Threads you save for later will appear here. Start exploring and save helpful
                  advice.
                </p>
              </div>
              <Button onClick={() => setActiveTab('Explore')} variant="outline" className="mt-4">
                Go to Explore
              </Button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass-panel p-6 w-full max-w-lg shadow-2xl space-y-6 bg-card"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Start a New Thread</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <textarea
                  placeholder="Share your thoughts, ask for advice, or just vent. It's completely anonymous..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full min-h-[150px] p-4 rounded-xl bg-secondary/50 border-none outline-none focus:ring-1 ring-primary/50 resize-none text-sm"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-sky-400" /> Posting as Hidden Fox 🦊
                  </div>
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim()}
                    className="gap-2"
                  >
                    Post Thread <Send className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

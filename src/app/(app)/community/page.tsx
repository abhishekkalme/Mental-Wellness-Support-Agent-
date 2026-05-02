"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Search, 
  MessageSquare, 
  Heart, 
  ShieldCheck, 
  Plus, 
  TrendingUp,
  Filter,
  ChevronRight
} from "lucide-react";

const groups = [
  { id: "g1", name: "Anxiety Support", members: "1.2k", active: "45", category: "Mental Health", icon: "🌱" },
  { id: "g2", name: "Study Stress & Burnout", members: "850", active: "12", category: "Academic", icon: "📚" },
  { id: "g3", name: "Loneliness & Connection", members: "2.1k", active: "120", category: "Social", icon: "🤝" },
  { id: "g4", name: "ADHD Strategies", members: "640", active: "8", category: "Neurodiversity", icon: "⚡" },
  { id: "g5", name: "Gratitude Daily", members: "3.4k", active: "200", category: "Wellness", icon: "🙏" },
];

const posts = [
  { id: "p1", user: "Anonymous Panda", time: "2h ago", content: "Had a really rough day today with exam prep, but I managed to finish one chapter. Small wins!", likes: 24, comments: 5 },
  { id: "p2", user: "Kind Soul", time: "4h ago", content: "Does anyone have tips for winding down after a 10pm lecture? My brain stays wired for hours.", likes: 12, comments: 18 },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("Explore");

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-10">
       <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sky-400 mb-2">
            <Users className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-widest">Safe Community</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Support Groups</h1>
          <p className="text-muted-foreground text-lg">You don't have to carry the weight alone. Join the conversation.</p>
        </div>
        
        <div className="flex gap-4">
           <Button variant="outline" className="gap-2 rounded-xl">
             <Filter className="w-4 h-4" /> Filters
           </Button>
           <Button className="gap-2 rounded-xl">
             <Plus className="w-4 h-4" /> Create Group
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="glass-panel p-6 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">My Groups</h3>
              <div className="space-y-2">
                {groups.slice(0, 3).map(g => (
                  <button key={g.id} className="w-full text-left p-3 rounded-xl hover:bg-secondary/50 transition-all flex items-center gap-3 group">
                     <span className="text-xl">{g.icon}</span>
                     <div className="flex-1 overflow-hidden">
                       <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{g.name}</p>
                       <p className="text-[10px] text-muted-foreground">{g.active} active now</p>
                     </div>
                  </button>
                ))}
              </div>
           </div>

           <div className="glass-panel p-8 bg-sky-400/5 border-sky-400/20 space-y-4">
              <ShieldCheck className="w-8 h-8 text-sky-400" />
              <h3 className="font-bold">Total Anonymity</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your profile is always hidden in community spaces. We use auto-generated aliases to keep your identity 100% private.
              </p>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
           <div className="flex gap-6 border-b border-border">
              {["Explore", "Recent Threads", "Saved"].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {tab}
                  {activeTab === tab && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
              ))}
           </div>

           {activeTab === "Explore" && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map(g => (
                  <div key={g.id} className="glass-panel p-6 hover:border-sky-400/30 transition-all cursor-pointer group">
                     <div className="flex justify-between items-start mb-4">
                        <div className="text-4xl">{g.icon}</div>
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-400/10 px-2 py-1 rounded-md uppercase tracking-widest">{g.category}</span>
                     </div>
                     <h4 className="text-lg font-bold group-hover:text-sky-400 transition-colors">{g.name}</h4>
                     <p className="text-sm text-muted-foreground mt-2">{g.members} members helping each other.</p>
                     <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex -space-x-2">
                           {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-secondary" />)}
                           <div className="text-[9px] font-bold pl-4 text-muted-foreground">+{parseInt(g.members)-3} more</div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-xs font-bold gap-1">
                          Join Group <ChevronRight className="w-3 h-3" />
                        </Button>
                     </div>
                  </div>
                ))}
             </div>
           )}

           {activeTab === "Recent Threads" && (
              <div className="space-y-4">
                 {posts.map(p => (
                   <div key={p.id} className="glass-panel p-8 space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">🐼</div>
                            <div>
                               <p className="text-sm font-bold">{p.user}</p>
                               <p className="text-[10px] text-muted-foreground">{p.time}</p>
                            </div>
                         </div>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Heart className="w-4 h-4" /></Button>
                      </div>
                      <p className="text-foreground/80 leading-relaxed">{p.content}</p>
                      <div className="flex items-center gap-6 pt-2">
                         <button className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                            <Heart className="w-4 h-4" /> {p.likes} Likes
                         </button>
                         <button className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                            <MessageSquare className="w-4 h-4" /> {p.comments} Comments
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           )}
        </div>
      </div>
    </main>
  );
}

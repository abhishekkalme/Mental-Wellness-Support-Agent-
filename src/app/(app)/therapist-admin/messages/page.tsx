'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Send, Loader2, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageThread {
  clientId: string;
  clientName: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}

interface Message {
  _id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/therapists/sessions?role=therapist&limit=200');
        if (res.ok) {
          const data = await res.json();
          const sessions = data.sessions || [];

          const threadMap = new Map<string, MessageThread>();
          for (const s of sessions) {
            const uid = s.userId?._id || 'unknown';
            if (!threadMap.has(uid)) {
              threadMap.set(uid, {
                clientId: uid,
                clientName: s.userId?.name || 'Unknown Client',
                lastMessage: `Session on ${s.date}`,
                lastMessageAt: s.date,
                unread: 0,
              });
            }
          }
          setThreads(Array.from(threadMap.values()));
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeThread) return;
    setSending(true);
    const msg: Message = {
      _id: Date.now().toString(),
      senderId: 'therapist',
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
    setSending(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <MessageSquare className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Messages</h1>
          <p className="text-xs text-white/40 font-bold uppercase tracking-[0.15em]">
            Secure client communication
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">
              Conversations
            </h3>
          </div>
          {threads.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-white/20 text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
              {threads.map((t) => (
                <button
                  key={t.clientId}
                  onClick={() => setActiveThread(t.clientId)}
                  className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${activeThread === t.clientId ? 'bg-purple-500/10' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-sm font-bold text-purple-400 shrink-0">
                      {t.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{t.clientName}</p>
                      <p className="text-xs text-white/40 truncate">{t.lastMessage}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-white/30">{t.lastMessageAt}</p>
                      {t.unread > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-[10px] font-bold text-white mt-1">
                          {t.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md flex flex-col min-h-[500px]">
          {activeThread ? (
            <>
              <div className="p-4 border-b border-white/5">
                <h3 className="text-sm font-bold text-white">
                  {threads.find((t) => t.clientId === activeThread)?.clientName || 'Client'}
                </h3>
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-[350px]">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-8 h-8 text-white/20 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">Start a conversation</p>
                    <p className="text-white/20 text-xs mt-1">Messages are end-to-end encrypted</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.senderId === 'therapist' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          msg.senderId === 'therapist'
                            ? 'bg-purple-500/20 text-white rounded-br-md'
                            : 'bg-white/10 text-white/80 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-[10px] text-white/30 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-white/5 flex gap-3">
                <input
                  className="flex-1 rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="rounded-xl bg-purple-500 px-4 text-white hover:bg-purple-600 disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/30 font-bold">Select a conversation</p>
                <p className="text-white/20 text-sm mt-1">Choose a client to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

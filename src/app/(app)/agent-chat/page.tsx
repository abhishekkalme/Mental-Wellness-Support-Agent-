"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Settings, Zap, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatMode = { safeMode: boolean; liteMode: boolean; ventOrganizeAct: boolean; };
type ApiResponse = { risk: "none" | "elevated" | "crisis"; reply: string };
type ChatMessage = { id: string; role: "user" | "agent"; content: string; };

export default function AgentChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: "1", role: "agent", content: "Hi! Main tumhara student wellness companion hoon. Tum kaisa feel kar rahe ho aaj?"
  }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<ChatMode>({ safeMode: false, liteMode: false, ventOrganizeAct: true });
  const [firstGen, setFirstGen] = useState(false);
  const [consentMemory, setConsentMemory] = useState<"session" | "weekly">("session");

  // Tool Specific States
  const [examStartDate, setExamStartDate] = useState("");
  const [examSubjects, setExamSubjects] = useState("Maths, Physics");
  const [examPlan, setExamPlan] = useState<string | null>(null);

  const [insightInputs, setInsightInputs] = useState({ bestMoment: "", worstMoment: "", oneImprovement: "" });
  const [insightCard, setInsightCard] = useState<string | null>(null);

  const [guiltAnswer, setGuiltAnswer] = useState("");
  const [guiltResult, setGuiltResult] = useState<{ state: string; steps: string[] } | null>(null);

  const [profType, setProfType] = useState<"extension" | "clarification" | "workload">("extension");
  const [profCourse, setProfCourse] = useState("CS101");
  const [profDeadline, setProfDeadline] = useState("Tomorrow 5pm");
  const [profScript, setProfScript] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  const uiHints = useMemo(() => [
    mode.safeMode ? "Safe Mode" : null,
    mode.liteMode ? "Lite Mode" : null,
    firstGen ? "First-Gen Lens" : null,
    mode.ventOrganizeAct ? "Vent→Organize→Act" : null,
    consentMemory === "weekly" ? "Weekly Memory" : "Session Memory",
  ].filter(Boolean) as string[], [mode, firstGen, consentMemory]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    if (mode.safeMode && text.toLowerCase() === "exit") {
      setMessages(p => [...p, { id: Date.now().toString(), role: "user", content: text }, { id: (Date.now()+1).toString(), role: "agent", content: "Okay. Pausing for now. Jab ready ho, bas ‘hi’ type kar dena." }]);
      setInput("");
      return;
    }

    const nextMessages = [...messages, { id: Date.now().toString(), role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, mode, context: { firstGen, consentMemory, examWeek: { startDate: examStartDate || undefined, subjects: examSubjects.split(",").map(s => s.trim()).filter(Boolean) } } })
      });
      const data = await res.json().catch(() => null) as ApiResponse | null;
      if (!res.ok || !data?.reply) throw new Error("API Exception");
      setMessages(p => [...p, { id: Date.now().toString(), role: "agent", content: data.reply }]);
    } catch {
      setMessages(p => [...p, { id: Date.now().toString(), role: "agent", content: "Agent Core Disconnected. Please verify API conditions in Admin panel." }]);
    } finally { setBusy(false); }
  }

  async function generateExamPlan() {
    setExamPlan(null); setBusy(true);
    try {
      const res = await fetch("/api/tools/exam-plan", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ startDate: examStartDate || undefined, subjects: examSubjects.split(",").map(s => s.trim()).filter(Boolean), hoursPerDay: 3, sleepWindow: "11pm–7am" })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.plan) throw new Error("Failed");
      setExamPlan(data.plan);
    } catch { setExamPlan("Core Error: Check external provider integration."); } finally { setBusy(false); }
  }

  async function generateInsightCard() {
    setInsightCard(null); setBusy(true);
    try {
      const res = await fetch("/api/tools/insight-card", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...insightInputs, tone: "hinglish" })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.card) throw new Error("Failed");
      setInsightCard(data.card);
    } catch { setInsightCard("Core Error: Provider unavailable."); } finally { setBusy(false); }
  }

  async function runGuiltDecoder() {
    setGuiltResult(null); setBusy(true);
    try {
      const res = await fetch("/api/tools/study-guilt", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answer: guiltAnswer }) });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.state) throw new Error();
      setGuiltResult({ state: data.state, steps: data.steps });
    } catch { setGuiltResult({ state: "error", steps: ["Core Error: Decoder offline."] }); } finally { setBusy(false); }
  }

  async function generateProfessorScript() {
    setProfScript(null); setBusy(true);
    try {
      const res = await fetch("/api/tools/professor-script", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: profType, course: profCourse, deadline: profDeadline, tone: "very polite" }) });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.text) throw new Error();
      setProfScript(data.text);
    } catch { setProfScript("Core Error: Text assembly failed."); } finally { setBusy(false); }
  }

  return (
    <div className="flex flex-col h-screen max-h-screen relative overflow-hidden bg-[#0A0D08]">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E2FF6F]/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-40 left-0 w-80 h-80 bg-[#E2FF6F]/3 blur-[100px] rounded-full" />
      </div>

      <header className="h-20 border-b border-white/5 flex items-center px-8 glass-panel rounded-none z-10 shrink-0 bg-white/[0.02]">
        <div className="flex items-center justify-between w-full">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-[#E2FF6F]/10 flex items-center justify-center border border-[#E2FF6F]/20">
                <Bot className="w-6 h-6 text-[#E2FF6F]" />
             </div>
             <div>
               <h1 className="font-bold text-xl text-white tracking-tight flex items-center gap-2">
                  Wellness Agent <span className="text-[10px] bg-[#E2FF6F] text-black px-2 py-0.5 rounded-full font-black tracking-widest uppercase">Deep Core</span>
               </h1>
               <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Neural Connection Active</p>
             </div>
           </div>
           <Button onClick={() => setMessages([{ id: "1", role: "agent", content: "Hi! Main tumhara student wellness companion hoon." }])} variant="outline" className="bg-white/5 hover:bg-[#E2FF6F] hover:text-black border-white/10">Reset Thread</Button>
        </div>
      </header>

      <section className="flex-1 p-8 relative z-10 grid gap-6 lg:grid-cols-12 overflow-hidden h-full">
        {/* Chat Component - Left side massive view */}
        <div className="flex flex-col rounded-[32px] border border-white/5 bg-white/5 shadow-2xl lg:col-span-8 overflow-hidden backdrop-blur-md">
          <div className="border-b border-white/5 p-4 flex gap-2 overflow-x-auto custom-scroll">
            {uiHints.map((h) => (
              <span key={h} className="rounded-full border border-[#E2FF6F]/20 bg-[#E2FF6F]/10 px-3 py-1 text-xs text-[#E2FF6F] whitespace-nowrap font-medium tracking-wide">
                {h}
              </span>
            ))}
          </div>

          {/* Chat List */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll">
             <AnimatePresence initial={false}>
               {messages.map((msg) => (
                 <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={cn("flex max-w-[85%] gap-4", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
                   <div className={cn("w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center border transition-all duration-500", msg.role === "user" ? "bg-white/5 border-white/10 text-white/40" : "bg-[#E2FF6F]/10 border-[#E2FF6F]/20 text-[#E2FF6F]")}>
                     {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                   </div>
                   <div className={cn("px-6 py-4 rounded-[28px] text-[15px] font-medium leading-relaxed shadow-xl", msg.role === "user" ? "bg-[#E2FF6F] text-black rounded-tr-sm shadow-[#E2FF6F]/5" : "bg-white/5 border border-white/5 text-white/90 rounded-tl-sm")}>
                     {msg.content}
                   </div>
                 </motion.div>
               ))}
               
               {busy && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex max-w-[80%] gap-4">
                     <div className="w-10 h-10 shrink-0 rounded-2xl bg-[#E2FF6F]/10 border border-[#E2FF6F]/20 text-[#E2FF6F] flex items-center justify-center">
                       <Bot className="w-5 h-5" />
                     </div>
                     <div className="px-6 py-4 rounded-[28px] rounded-tl-sm bg-white/5 border border-white/5 text-sm flex items-center gap-3 text-[#E2FF6F] font-bold overflow-hidden relative">
                       <Loader2 className="w-4 h-4 animate-spin text-[#E2FF6F]" /> COMPUTING...
                     </div>
                  </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="p-6 bg-black/20 border-t border-white/5">
            <form className="flex gap-4 p-2 rounded-[24px] bg-white/5 border border-white/10 focus-within:border-[#E2FF6F]/30 transition-all duration-500" onSubmit={(e) => { e.preventDefault(); send(); }}>
              <input
                className="flex-1 bg-transparent border-none outline-none px-4 text-base text-white placeholder-white/30"
                value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode.safeMode ? "Type strictly (type 'exit' to pause)..." : "Ask your wellness agent..."}
              />
              <Button type="submit" disabled={!input.trim() || busy} className="w-12 h-12 rounded-full bg-[#E2FF6F] hover:bg-[#d4f056] text-black shadow-xl disabled:bg-white/10 disabled:text-white/20">
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </div>

        {/* Feature Tools Console - Right side */}
        <div className="rounded-[32px] border border-white/5 bg-white/5 p-6 shadow-2xl lg:col-span-4 overflow-y-auto max-h-[calc(100vh-140px)] custom-scroll backdrop-blur-md">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-6"><Settings className="w-5 h-5 text-[#E2FF6F]" /> Agent Modules</h2>

          {/* Toggles */}
          <div className="space-y-4 text-sm text-white/80 font-medium pb-6 border-b border-white/5">
             {[
               { label: "Hostel Safe Mode", val: mode.safeMode, op: (v:boolean) => setMode({...mode, safeMode: v}) },
               { label: "Lite Connection", val: mode.liteMode, op: (v:boolean) => setMode({...mode, liteMode: v}) },
               { label: "Goal-Oriented Action", val: mode.ventOrganizeAct, op: (v:boolean) => setMode({...mode, ventOrganizeAct: v}) },
               { label: "First-Gen Empathetic", val: firstGen, op: (v:boolean) => setFirstGen(v) }
             ].map((toggle) => (
                <label key={toggle.label} className="flex justify-between items-center bg-white/5 p-3 px-4 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <span>{toggle.label}</span>
                  <input type="checkbox" checked={toggle.val} onChange={(e) => toggle.op(e.target.checked)} className="accent-[#E2FF6F] w-4 h-4 rounded text-black border-transparent bg-white/20" />
                </label>
             ))}
             
             <div className="pt-2">
                <p className="text-[11px] text-white/40 uppercase font-black tracking-wider mb-2">Memory Persistence Layer</p>
                <div className="grid grid-cols-2 gap-2">
                  {[["session", "Volatile"], ["weekly", "Persistent"]].map(([k, label]) => (
                     <button key={k} onClick={() => setConsentMemory(k as any)} className={cn("rounded-xl border py-2 text-xs font-bold transition-all", consentMemory === k ? "bg-[#E2FF6F] text-black border-[#E2FF6F]" : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10")}>{label}</button>
                  ))}
                </div>
             </div>
          </div>

          {/* Tools Modules */}
          <div className="mt-6 space-y-6">
             <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 font-bold mb-3"><BookOpen className="w-4 h-4 text-sky-400" /> Study Core</div>
                <div className="space-y-2">
                  <input className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#E2FF6F]/50 text-white placeholder-white/30" placeholder="Focus Subjects (Maths...)" value={examSubjects} onChange={(e) => setExamSubjects(e.target.value)} />
                  <Button disabled={busy} onClick={generateExamPlan} className="w-full rounded-xl bg-white/10 hover:bg-sky-400 hover:text-black hover:border-transparent text-white border border-white/10 transition-all text-xs font-bold py-5 mt-2">Activate Exam Routing</Button>
                  {examPlan && <div className="mt-2 p-3 text-xs bg-sky-900/20 text-sky-200 border border-sky-500/20 rounded-xl leading-relaxed">{examPlan}</div>}
                </div>
             </div>

             <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 font-bold mb-3"><Sparkles className="w-4 h-4 text-purple-400" /> Insight Engine</div>
                <div className="space-y-2">
                  <input className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#E2FF6F]/50 text-white placeholder-white/30" placeholder="Best moment..." value={insightInputs.bestMoment} onChange={(e) => setInsightInputs(s => ({...s, bestMoment: e.target.value}))} />
                  <input className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#E2FF6F]/50 text-white placeholder-white/30" placeholder="Worst moment..." value={insightInputs.worstMoment} onChange={(e) => setInsightInputs(s => ({...s, worstMoment: e.target.value}))} />
                  <input className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#E2FF6F]/50 text-white placeholder-white/30" placeholder="Improvement metric..." value={insightInputs.oneImprovement} onChange={(e) => setInsightInputs(s => ({...s, oneImprovement: e.target.value}))} />
                  <Button disabled={busy} onClick={generateInsightCard} className="w-full rounded-xl bg-white/10 hover:bg-purple-400 hover:text-black hover:border-transparent text-white border border-white/10 transition-all text-xs font-bold py-5 mt-2">Generate Card</Button>
                  {insightCard && <div className="mt-2 p-3 text-xs bg-purple-900/20 text-purple-200 border border-purple-500/20 rounded-xl leading-relaxed whitespace-pre-wrap">{insightCard}</div>}
                </div>
             </div>

             <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 font-bold mb-3"><Zap className="w-4 h-4 text-amber-400" /> Decoder Array</div>
                <div className="space-y-2">
                  <input className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#E2FF6F]/50 text-white placeholder-white/30" placeholder="Current state (Panic, tired)..." value={guiltAnswer} onChange={(e) => setGuiltAnswer(e.target.value)} />
                  <Button disabled={busy} onClick={runGuiltDecoder} className="w-full rounded-xl bg-white/10 hover:bg-amber-400 hover:text-black hover:border-transparent text-white border border-white/10 transition-all text-xs font-bold py-5 mt-2">Initialize Decay Route</Button>
                  {guiltResult && (
                     <div className="mt-2 p-3 text-xs bg-amber-900/20 text-amber-200 border border-amber-500/20 rounded-xl leading-relaxed space-y-2">
                        <div className="font-bold border-b border-amber-500/10 pb-2">Status: {guiltResult.state}</div>
                        <ul className="list-disc pl-4 opacity-80">{guiltResult.steps.map((s,i) => <li key={i}>{s}</li>)}</ul>
                     </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}

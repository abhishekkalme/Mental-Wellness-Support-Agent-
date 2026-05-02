"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProviderId } from "@/lib/types";
import { Settings, Save, RefreshCw, KeyRound, Server, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SettingsResponse = {
  provider: ProviderId;
  apiKey: string;
  model?: string;
  updatedAt: string;
};

export default function AdminPage() {
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsResponse | null>(null);

  const headers = useMemo(() => {
    const h: Record<string, string> = {};
    if (adminPassword) h["x-admin-password"] = adminPassword;
    return h;
  }, [adminPassword]);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", { headers });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as any;
        throw new Error(j?.error ?? "Failed to load settings");
      }
      const j = (await res.json()) as SettingsResponse;
      setSettings(j);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load settings");
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }

  async function save(next: Partial<SettingsResponse>) {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify({
          provider: next.provider ?? settings.provider,
          apiKey: typeof next.apiKey === "string" ? next.apiKey : undefined,
          model: typeof next.model === "string" ? next.model : undefined,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as any;
        throw new Error(j?.error ?? "Failed to save settings");
      }
      const j = (await res.json()) as SettingsResponse;
      setSettings(j);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-screen max-h-screen relative overflow-hidden bg-[#0A0D08]">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E2FF6F]/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-40 left-0 w-80 h-80 bg-[#E2FF6F]/3 blur-[100px] rounded-full" />
      </div>

      <header className="h-20 border-b border-white/5 flex items-center px-8 glass-panel rounded-none z-10 shrink-0 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#E2FF6F]/10 flex items-center justify-center border border-[#E2FF6F]/20">
             <Settings className="w-6 h-6 text-[#E2FF6F]" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-white tracking-tight">Admin System</h1>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Neural Node Configurations</p>
          </div>
        </div>
      </header>

      <section className="flex-1 overflow-y-auto p-10 relative z-10 mx-auto w-full max-w-3xl custom-scroll">
        <div className="space-y-3 mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">Agent Overrides</h2>
          <p className="text-sm text-white/50 leading-relaxed max-w-xl">
            Switch your primary AI Provider and Model logic dynamically. You must be authenticated to modify system-level environment paths.
          </p>
        </div>

        {/* Global Key Loader Panel */}
        <div className="rounded-[32px] border border-white/5 bg-white/5 p-8 shadow-2xl backdrop-blur-md mb-8">
          <label className="flex items-center gap-2 text-sm font-bold text-white mb-4">
             <KeyRound className="w-4 h-4 text-[#E2FF6F]" /> Master Admin Password
          </label>
          <div className="flex gap-4">
            <input
              className="flex-1 rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-sm text-white outline-none focus:border-[#E2FF6F]/50 placeholder-white/20 transition-all font-medium"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter server password to unmask settings..."
              type="password"
            />
            <Button
              onClick={load}
              className="rounded-2xl border border-white/10 bg-white/10 px-6 font-bold text-white hover:bg-[#E2FF6F] hover:text-black transition-all disabled:opacity-50 h-auto"
              disabled={loading}
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? "Decrypting..." : "Decrypt Config"}
            </Button>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm font-medium text-rose-500 flex items-center gap-2">
               {error}
            </div>
          )}
        </div>

        {/* Configurations Panel */}
        {settings ? (
          <div className="rounded-[32px] border border-white/5 bg-white/5 p-8 shadow-2xl backdrop-blur-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-white">
                <Server className="w-4 h-4 text-sky-400" /> Default Provider Engine
              </label>
              <select
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-sm text-white outline-none focus:border-[#E2FF6F]/50 appearance-none font-medium"
                value={settings.provider}
                onChange={(e) => setSettings((s) => s ? { ...s, provider: e.target.value as ProviderId } : s)}
              >
                <option value="gemini" className="bg-[#0A0D08]">Gemini Core (Free-Tier API)</option>
                <option value="openrouter" className="bg-[#0A0D08]">OpenRouter Backbone (Production)</option>
                <option value="ollama" className="bg-[#0A0D08]">Ollama Node (Local Dedicated)</option>
              </select>
              <p className="text-xs font-medium text-sky-400/80 bg-sky-400/10 border border-sky-400/20 p-3 rounded-xl inline-block mt-2">
                Log: Gemini & OpenRouter are the primary tested integrations.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-white">
                 <Zap className="w-4 h-4 text-purple-400" /> Specific Target Model
              </label>
              <input
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-sm text-white outline-none focus:border-[#E2FF6F]/50 placeholder-white/20 font-medium tracking-wide"
                value={settings.model ?? ""}
                onChange={(e) => setSettings((s) => (s ? { ...s, model: e.target.value } : s))}
                placeholder="e.g. gemini-1.5-flash / llama-3"
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-white">
                 <KeyRound className="w-4 h-4 text-amber-400" /> Authorized API Key Override
              </label>
              <input
                className="w-full rounded-2xl bg-black/40 border border-white/10 px-5 py-4 text-sm text-amber-300 outline-none focus:border-[#E2FF6F]/50 placeholder-amber-400/30 font-medium tracking-wider"
                defaultValue=""
                placeholder={settings.apiKey ? `[MASKED] ${settings.apiKey}` : "Install new security token..."}
                onChange={(e) => setSettings((s) => (s ? { ...s, apiKey: e.target.value } : s))}
                type="password"
              />
              <p className="text-xs text-white/40 font-medium pl-1">
                Keys securely overwrite the primary .env.local logic during execution.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Last Synchronization</span>
                 <span className="text-xs text-white/70 font-mono bg-white/5 px-2 py-1 rounded-md">{new Date(settings.updatedAt).toLocaleString()}</span>
              </div>
              <Button
                onClick={() =>
                  save({
                    provider: settings.provider,
                    apiKey: settings.apiKey.startsWith("***") ? undefined : settings.apiKey,
                    model: settings.model,
                  })
                }
                className="rounded-2xl bg-[#E2FF6F] px-8 py-6 text-sm font-bold text-black hover:bg-[#d4f056] shadow-xl shadow-[#E2FF6F]/10 disabled:opacity-50 transition-all active:scale-95"
                disabled={saving}
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? "Deploying override..." : "Commit Global Changes"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex items-center justify-center p-10 border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
            <span className="text-white/30 text-sm font-bold uppercase tracking-widest">
               {loading ? <><RefreshCw className="w-4 h-4 animate-spin inline mr-2"/> Encrypting link...</> : "Awaiting Security Matrix"}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}

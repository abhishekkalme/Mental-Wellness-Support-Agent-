'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Globe,
  Users,
  Shield,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'te', label: 'Telugu' },
  { code: 'ta', label: 'Tamil' },
  { code: 'mr', label: 'Marathi' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'kn', label: 'Kannada' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'or', label: 'Odia' },
  { code: 'as', label: 'Assamese' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'neutral', label: 'Neutral' },
] as const;

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const store = useStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState(store.preferredLanguage || 'en');
  const [agentGender, setAgentGender] = useState(store.agentGender || 'neutral');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      if (settingsLoaded || !session?.user?.email) return;
      
      try {
        const res = await fetch('/api/admin/settings', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.name) store.setName(data.name);
          if (data.preferredLanguage) {
            store.setPreferredLanguage(data.preferredLanguage);
            setPreferredLanguage(data.preferredLanguage);
          }
          if (data.agentGender) {
            store.setAgentGender(data.agentGender);
            setAgentGender(data.agentGender);
          }
          if (data.name) setNameInput(data.name);
          setSettingsLoaded(true);
        }
      } catch {
        setNameInput(store.name || session?.user?.name || '');
        setPreferredLanguage(store.preferredLanguage || 'en');
        setAgentGender(store.agentGender || 'neutral');
        setSettingsLoaded(true);
      }
    };
    if (mounted && session?.user?.email) {
      loadSettings();
    }
  }, [mounted, session?.user?.email]);

  useEffect(() => {
    if (mounted && settingsLoaded) {
      setNameInput(store.name || session?.user?.name || '');
      setPreferredLanguage(store.preferredLanguage || 'en');
      setAgentGender(store.agentGender || 'neutral');
    }
  }, [mounted, settingsLoaded]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: nameInput.trim(),
          preferredLanguage,
          agentGender,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        store.setName(data.name);
        store.setUsername(store.username);
        store.setPreferredLanguage(data.preferredLanguage);
        store.setAgentGender(data.agentGender);
        await updateSession({ name: data.name });
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
        setIsEditingName(false);
      } else {
        const error = await res.json();
        setSaveMessage({ type: 'error', text: error.error || 'Failed to save settings' });
      }
    } catch {
      setSaveMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleSync = async () => {
    await store.syncRemoteData();
  };

  const handleSafeModeToggle = () => {
    store.setSafeMode(!store.safeMode);
  };

  const formatLastActive = (dateStr: string | undefined) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A0D08] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E2FF6F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D08]">
      <header className="sticky top-0 z-40 bg-[#0A0D08]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center h-16 px-4 md:px-6 max-w-4xl mx-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1 className="ml-4 text-lg font-bold text-white">Settings</h1>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <section className="p-4 md:p-6 rounded-2xl bg-white/5 border border-white/5">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#E2FF6F]" />
              Profile
            </h2>

            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm text-white/60">Display Name</label>
                {isEditingName ? (
                  <div className="flex gap-2">
                    <Input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Enter your name"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (nameInput.trim()) {
                          handleSave();
                        }
                      }}
                      disabled={isSaving || !nameInput.trim()}
                      className="bg-[#E2FF6F] text-black hover:bg-[#E2FF6F]/90"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsEditingName(false);
                        setNameInput(store.name || session?.user?.name || '');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm flex-1">
                      {store.name || session?.user?.name || 'Not set'}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingName(true)}
                      className="text-[#E2FF6F] hover:text-[#E2FF6F]/80"
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-white/60">Username</label>
                <span className="text-white/40 text-sm">
                  {store.username || session?.user?.username || 'Not set'}
                </span>
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-white/60 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <span className="text-white/40 text-sm">
                  {session?.user?.email || 'Not available'}
                </span>
              </div>
            </div>
          </section>

          <section className="p-4 md:p-6 rounded-2xl bg-white/5 border border-white/5">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#E2FF6F]" />
              Preferences
            </h2>

            <div className="space-y-6">
              <div className="grid gap-2">
                <label className="text-sm text-white/60">Preferred Language</label>
                <div className="relative">
                  <button
                    onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                    className="w-full flex items-center justify-between h-11 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white hover:border-white/20 transition-colors"
                  >
                    <span>
                      {LANGUAGES.find((l) => l.code === preferredLanguage)?.label || 'English'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-white/40 transition-transform ${
                        languageDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {languageDropdownOpen && (
                    <div className="absolute top-full mt-2 w-full max-h-60 overflow-y-auto bg-[#141716] border border-white/10 rounded-xl shadow-xl z-10">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setPreferredLanguage(lang.code);
                            setLanguageDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            preferredLanguage === lang.code
                              ? 'text-[#E2FF6F] bg-[#E2FF6F]/10'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-white/60 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Agent Gender
                </label>
                <div className="flex gap-2">
                  {GENDER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAgentGender(option.value)}
                      className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                        agentGender === option.value
                          ? 'bg-[#E2FF6F]/10 border-[#E2FF6F] text-[#E2FF6F]'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-white/60 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Safe Mode
                </label>
                <button
                  onClick={handleSafeModeToggle}
                  className={`w-14 h-7 rounded-full transition-colors relative ${
                    store.safeMode ? 'bg-[#E2FF6F]' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      store.safeMode ? 'left-8' : 'left-1'
                    }`}
                  />
                </button>
                <p className="text-xs text-white/40">
                  Enable safe mode for the AI companion
                </p>
              </div>

              {saveMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2 p-3 rounded-xl ${
                    saveMessage.type === 'success'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {saveMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">{saveMessage.text}</span>
                </motion.div>
              )}

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#E2FF6F] text-black hover:bg-[#E2FF6F]/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
            </div>
          </section>

          <section className="p-4 md:p-6 rounded-2xl bg-white/5 border border-white/5">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#E2FF6F]" />
              Sync
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Status</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    store.syncStatus === 'idle'
                      ? 'bg-white/10 text-white/60'
                      : store.syncStatus === 'syncing'
                      ? 'bg-yellow-500/10 text-yellow-400'
                      : store.syncStatus === 'success'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {store.syncStatus === 'syncing' && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  {store.syncStatus === 'success' && <CheckCircle className="w-3 h-3" />}
                  {store.syncStatus === 'error' && <AlertCircle className="w-3 h-3" />}
                  {store.syncStatus.charAt(0).toUpperCase() + store.syncStatus.slice(1)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Last Active</span>
                <span className="text-sm text-white/40">
                  {formatLastActive(store.lastActive)}
                </span>
              </div>

              <Button
                onClick={handleSync}
                disabled={store.syncStatus === 'syncing'}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {store.syncStatus === 'syncing' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>
          </section>

          <section className="p-4 md:p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
            <h2 className="text-base font-semibold text-red-400 mb-4 flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              Danger Zone
            </h2>

            <p className="text-sm text-white/40 mb-4">
              Sign out of your account on this device.
            </p>

            <Button
              onClick={() => {
                store.clearStore();
                store.clearPersistedData();
                signOut({ callbackUrl: '/' });
              }}
              variant="destructive"
              className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
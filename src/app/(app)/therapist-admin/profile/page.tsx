'use client';

import { useEffect, useState } from 'react';
import {
  Save,
  Loader2,
  UserCircle,
  Plus,
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TherapistProfile } from '@/lib/types';
import toast from 'react-hot-toast';
import { CURRENCIES, getCurrencySymbol } from '@/lib/currency';
import { searchTimezones, getTimezoneLabel } from '@/lib/timezones';

export default function ProfilePage() {
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [bio, setBio] = useState('');
  const [title, setTitle] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newSpec, setNewSpec] = useState('');
  const [languages, setLanguages] = useState<string[]>(['en']);
  const [sessionTypes, setSessionTypes] = useState<string[]>(['video']);
  const [pricingChat, setPricingChat] = useState(30);
  const [pricingVideo, setPricingVideo] = useState(50);
  const [pricingPhone, setPricingPhone] = useState(40);
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');
  const [tzSearch, setTzSearch] = useState('');
  const [tzOpen, setTzOpen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(50);
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [gender, setGender] = useState('');
  const [acceptsInsurance, setAcceptsInsurance] = useState(false);
  const [insuranceProviders, setInsuranceProviders] = useState<string[]>([]);
  const [newInsurance, setNewInsurance] = useState('');
  const [education, setEducation] = useState<
    { degree: string; institution: string; year: number }[]
  >([]);

  useEffect(() => {
    fetch('/api/therapists/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (p) {
          setProfile(p);
          setBio(p.bio || '');
          setTitle(p.title || '');
          setSpecializations(p.specializations || []);
          setLanguages(p.languages || ['en']);
          setSessionTypes(p.sessionTypes || ['video']);
          setPricingChat(p.pricing?.chat || 30);
          setPricingVideo(p.pricing?.video || 50);
          setPricingPhone(p.pricing?.phone || 40);
          setCurrency(p.currency || 'USD');
          setTimezone(p.timezone || 'UTC');
          setSessionDuration(p.sessionDuration || 50);
          setYearsOfExperience(p.yearsOfExperience || 0);
          setGender(p.gender || '');
          setAcceptsInsurance(p.acceptsInsurance || false);
          setInsuranceProviders(p.insuranceProviders || []);
          setEducation(p.education || []);
        }
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/therapists/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          title,
          specializations,
          languages,
          sessionTypes,
          pricing: { chat: pricingChat, video: pricingVideo, phone: pricingPhone },
          currency,
          timezone,
          sessionDuration,
          yearsOfExperience,
          gender,
          acceptsInsurance,
          insuranceProviders,
          education,
        }),
      });
      if (res.ok) {
        toast.success('Profile saved!');
      } else {
        toast.error('Failed to save');
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const toggleSessionType = (type: string) => {
    setSessionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleLanguage = (code: string) => {
    setLanguages((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );
  };

  const addSpec = () => {
    if (newSpec.trim() && !specializations.includes(newSpec.trim())) {
      setSpecializations([...specializations, newSpec.trim()]);
      setNewSpec('');
    }
  };

  const addInsurance = () => {
    if (newInsurance.trim() && !insuranceProviders.includes(newInsurance.trim())) {
      setInsuranceProviders([...insuranceProviders, newInsurance.trim()]);
      setNewInsurance('');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const LANGUAGES_LIST = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'bn', name: 'Bengali' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'ur', name: 'Urdu' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <UserCircle className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Profile</h1>
          <p className="text-xs text-white/40 font-bold uppercase tracking-[0.15em]">
            Manage your professional profile
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md space-y-6">
        <div className="flex items-center gap-2 mb-4">
          {profile?.verificationStatus === 'verified' ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
            </span>
          ) : profile?.verificationStatus === 'rejected' ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" /> Rejected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" /> Pending Verification
            </span>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
            Professional Title
          </label>
          <input
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Licensed Clinical Psychologist"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Bio</label>
          <textarea
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50 min-h-[120px] resize-y"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell clients about your approach, experience, and what you specialize in..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
            Specializations
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50"
              value={newSpec}
              onChange={(e) => setNewSpec(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSpec()}
              placeholder="e.g. Anxiety, Depression..."
            />
            <button
              onClick={addSpec}
              className="px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {specializations.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-bold"
              >
                {s}
                <button onClick={() => setSpecializations(specializations.filter((x) => x !== s))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
            Languages
          </label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES_LIST.map((l) => {
              const isSelected = languages.includes(l.code);
              return (
                <button
                  key={l.code}
                  onClick={() => toggleLanguage(l.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-black/40 text-white/50 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {l.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
            Session Types
          </label>
          <div className="flex gap-2">
            {['video', 'chat', 'phone'].map((type) => (
              <button
                key={type}
                onClick={() => toggleSessionType(type)}
                className={`flex-1 p-3 rounded-xl text-xs font-bold transition-all ${
                  sessionTypes.includes(type)
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-black/40 text-white/50 border border-white/10'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
            Currency
          </label>
          <select
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-[#0A0D08]">
                {c.symbol} {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
              Chat Price ({getCurrencySymbol(currency)})
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50"
              value={pricingChat}
              onChange={(e) => setPricingChat(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
              Video Price ({getCurrencySymbol(currency)})
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50"
              value={pricingVideo}
              onChange={(e) => setPricingVideo(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
              Phone Price ({getCurrencySymbol(currency)})
            </label>
            <input
              type="number"
              min={0}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50"
              value={pricingPhone}
              onChange={(e) => setPricingPhone(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2 relative">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
            Timezone
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search timezone..."
              value={tzSearch}
              onFocus={() => setTzOpen(true)}
              onChange={(e) => {
                setTzSearch(e.target.value);
                setTzOpen(true);
              }}
              onBlur={() => setTimeout(() => setTzOpen(false), 150)}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50 placeholder-white/20"
            />

            {/* Clear button — matches the X pattern used on specializations/insurance tags */}
            {tzSearch && (
              <button
                tabIndex={-1}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setTimezone('UTC');
                  setTzSearch('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {tzOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-xl bg-[#0A0D08] border border-white/10 shadow-2xl overflow-hidden">
                <ul className="max-h-48 overflow-y-auto py-1">
                  {searchTimezones(tzSearch).length === 0 ? (
                    <li className="px-4 py-3 text-xs text-white/30">No timezones found</li>
                  ) : (
                    searchTimezones(tzSearch).map((tz) => (
                      <li key={tz.zone + '|' + tz.label}>
                        <button
                          type="button"
                          onMouseDown={() => {
                            setTimezone(tz.zone);
                            setTzSearch(tz.label);
                            setTzOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                            timezone === tz.zone
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'text-white/70 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span>{tz.label}</span>
                          {timezone === tz.zone && (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          )}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Gender</label>
          <select
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="" className="bg-[#0A0D08]">
              Prefer not to say
            </option>
            <option value="male" className="bg-[#0A0D08]">
              Male
            </option>
            <option value="female" className="bg-[#0A0D08]">
              Female
            </option>
            <option value="non-binary" className="bg-[#0A0D08]">
              Non-binary
            </option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setAcceptsInsurance(!acceptsInsurance)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                acceptsInsurance ? 'bg-purple-400 border-purple-400' : 'border-white/20'
              }`}
            >
              {acceptsInsurance && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
            </div>
            <span className="text-sm font-medium text-white/80">Accepts Insurance</span>
          </label>
          {acceptsInsurance && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50"
                  value={newInsurance}
                  onChange={(e) => setNewInsurance(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addInsurance()}
                  placeholder="Insurance provider..."
                />
                <button
                  onClick={addInsurance}
                  className="px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {insuranceProviders.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold"
                  >
                    {p}
                    <button
                      onClick={() =>
                        setInsuranceProviders(insuranceProviders.filter((x) => x !== p))
                      }
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        {error && <p className="text-xs text-rose-400">{error}</p>}
        <Button
          onClick={saveProfile}
          disabled={saving}
          className="rounded-xl bg-purple-500 px-6 py-3 text-xs font-bold text-white hover:bg-purple-600 disabled:opacity-50 ml-auto"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 mr-1.5" /> Save Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

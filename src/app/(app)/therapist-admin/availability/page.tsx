'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Save, Loader2, Plus, X, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AvailabilitySlot } from '@/lib/types';
import toast from 'react-hot-toast';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

interface TimeBlock {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  bufferMinutes: number;
}

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);

  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);

  useEffect(() => {
    fetch('/api/therapists/availability')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setSlots(data);
        const blocks: TimeBlock[] = data.map((s: AvailabilitySlot) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          bufferMinutes: s.bufferMinutes || 10,
        }));
        setTimeBlocks(blocks);
      })
      .catch(() => toast.error('Failed to load availability'))
      .finally(() => setLoading(false));
  }, []);

  const addBlock = (dayOfWeek: number) => {
    setTimeBlocks([
      ...timeBlocks,
      { dayOfWeek, startTime: '09:00', endTime: '10:00', bufferMinutes: 10 },
    ]);
  };

  const updateBlock = (index: number, field: keyof TimeBlock, value: string | number) => {
    const updated = [...timeBlocks];
    (updated[index] as any)[field] = value;
    setTimeBlocks(updated);
  };

  const removeBlock = (index: number) => {
    setTimeBlocks(timeBlocks.filter((_, i) => i !== index));
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/therapists/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timeBlocks),
      });
      if (res.ok) {
        toast.success('Availability saved!');
      } else {
        toast.error('Failed to save availability');
      }
    } catch {
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const blocksForDay = (day: number) =>
    timeBlocks
      .filter((b) => b.dayOfWeek === day)
      .map((b, i, arr) => ({ ...b, globalIndex: timeBlocks.indexOf(b) }));

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <CalendarDays className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Availability</h1>
          <p className="text-xs text-white/40 font-bold uppercase tracking-[0.15em]">
            Set your weekly schedule
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {DAYS.map((day, dayIndex) => {
          const dayBlocks = blocksForDay(dayIndex);
          return (
            <div
              key={day}
              className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">{day}</h3>
                <button
                  onClick={() => addBlock(dayIndex)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition-all"
                >
                  <Plus className="w-3 h-3" /> Add Slot
                </button>
              </div>
              {dayBlocks.length === 0 ? (
                <p className="text-xs text-white/30">No availability set for {day}</p>
              ) : (
                <div className="space-y-2">
                  {dayBlocks.map((block, bi) => (
                    <div
                      key={bi}
                      className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5"
                    >
                      <Clock className="w-4 h-4 text-white/30 shrink-0" />
                      <select
                        className="rounded-lg bg-black/40 border border-white/10 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-500/50"
                        value={block.startTime}
                        onChange={(e) =>
                          updateBlock(block.globalIndex, 'startTime', e.target.value)
                        }
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h} className="bg-[#0A0D08]">
                            {h}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs text-white/30">to</span>
                      <select
                        className="rounded-lg bg-black/40 border border-white/10 px-2 py-1.5 text-xs text-white outline-none focus:border-purple-500/50"
                        value={block.endTime}
                        onChange={(e) => updateBlock(block.globalIndex, 'endTime', e.target.value)}
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h} className="bg-[#0A0D08]">
                            {h}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-white/30">Buffer:</span>
                      <select
                        className="rounded-lg bg-black/40 border border-white/10 px-2 py-1.5 text-[10px] text-white outline-none focus:border-purple-500/50"
                        value={block.bufferMinutes}
                        onChange={(e) =>
                          updateBlock(block.globalIndex, 'bufferMinutes', Number(e.target.value))
                        }
                      >
                        {[0, 5, 10, 15, 30].map((m) => (
                          <option key={m} value={m} className="bg-[#0A0D08]">
                            {m}min
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeBlock(block.globalIndex)}
                        className="ml-auto p-1.5 rounded-lg hover:bg-rose-500/10 text-white/30 hover:text-rose-400 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button
          onClick={saveAvailability}
          disabled={saving}
          className="rounded-xl bg-purple-500 px-6 py-3 text-xs font-bold text-white hover:bg-purple-600 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Saving...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 mr-1.5" /> Save Availability
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

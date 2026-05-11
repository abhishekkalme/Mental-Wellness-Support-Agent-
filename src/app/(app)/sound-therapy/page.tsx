'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Music,
  CloudRain,
  Trees,
  Waves,
  Wind,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Pause,
} from 'lucide-react';

type SoundAsset = {
  id: string;
  name: string;
  icon: any;
  color: string;
  gradient: string;
};

const soundAssets: SoundAsset[] = [
  {
    id: 'rain',
    name: 'Rainfall',
    icon: CloudRain,
    color: 'text-blue-500',
    gradient: 'from-blue-500/20 to-cyan-500/10',
  },
  {
    id: 'forest',
    name: 'Forest Birds',
    icon: Trees,
    color: 'text-emerald-500',
    gradient: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    icon: Waves,
    color: 'text-sky-500',
    gradient: 'from-sky-500/20 to-blue-500/10',
  },
  {
    id: 'wind',
    name: 'Soft Wind',
    icon: Wind,
    color: 'text-slate-400',
    gradient: 'from-slate-400/20 to-slate-200/10',
  },
  {
    id: 'fire',
    name: 'Crackling Fire',
    icon: Flame,
    color: 'text-orange-500',
    gradient: 'from-orange-500/20 to-red-500/10',
  },
];

export default function SoundTherapyPage() {
  const [volumes, setVolumes] = useState<Record<string, number>>({
    rain: 0,
    forest: 0,
    ocean: 0,
    wind: 0,
    fire: 0,
  });

  const [isPlaying, setIsPlaying] = useState(false);

  const handleVolumeChange = (id: string, val: number) => {
    setVolumes((prev) => ({ ...prev, [id]: val }));
    if (val > 0 && !isPlaying) setIsPlaying(true);
  };

  const toggleAll = () => {
    setIsPlaying(!isPlaying);
  };

  const resetAll = () => {
    setVolumes({ rain: 0, forest: 0, ocean: 0, wind: 0, fire: 0 });
    setIsPlaying(false);
  };

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Music className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-widest">Ambient Therapy</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Sound Mixer</h1>
          <p className="text-muted-foreground text-lg italic">
            Create your perfect restorative atmosphere.
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            variant={isPlaying ? 'outline' : 'primary'}
            size="lg"
            className="rounded-full h-16 w-16"
            onClick={toggleAll}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </Button>
          <Button variant="ghost" size="lg" className="rounded-2xl" onClick={resetAll}>
            Mute All
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {soundAssets.map((sound) => {
          const vol = volumes[sound.id];
          const isActive = vol > 0 && isPlaying;

          return (
            <motion.div
              key={sound.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-panel p-8 space-y-8 relative overflow-hidden group transition-all border-2 ${
                isActive ? 'border-primary/40 bg-primary/5' : 'border-transparent'
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${sound.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
              />

              <div className="flex items-center justify-between relative z-10">
                <div className={`p-4 rounded-2xl bg-background shadow-sm ${sound.color}`}>
                  <sound.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase">
                  {vol > 0 ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                  {vol}%
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <h3 className="text-xl font-bold">{sound.name}</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={vol}
                    onChange={(e) => handleVolumeChange(sound.id, parseInt(e.target.value))}
                    className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">
                    <span>Silent</span>
                    <span>Intense</span>
                  </div>
                </div>
              </div>

              {isActive && (
                <motion.div
                  layoutId={`playing-${sound.id}`}
                  className="absolute bottom-0 left-0 h-1 bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="glass-panel p-8 bg-blue-500/5 border-blue-500/20 rounded-3xl flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
          <Volume2 className="w-8 h-8" />
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-bold text-lg">Pro Tip: The Golden Ratio</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For maximum focus, try setting <strong>Rain</strong> to 60%, <strong>Soft Wind</strong>{' '}
            to 30%, and a touch of <strong>Forest Birds</strong> at 10%. This creates a rich,
            natural soundscape that masks distracting frequencies.
          </p>
        </div>
      </div>
    </main>
  );
}

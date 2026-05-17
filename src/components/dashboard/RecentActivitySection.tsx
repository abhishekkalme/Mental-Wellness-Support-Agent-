'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecentItem } from '@/app/(app)/dashboard/hooks';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function RecentActivitySection({ items }: { items: RecentItem[] }) {
  if (!items.length) return null;

  return (
    <motion.div variants={itemVariants} className="surface-card p-5 md:p-6">
      <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">
        Recent Activity
      </h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {items.map((item, i) => (
          <motion.div key={item.id} variants={itemVariants} transition={{ delay: i * 0.05 }}>
            <Link
              href={item.href}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all group"
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full mt-1.5 shrink-0',
                  item.color.replace('text', 'bg')
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/80 truncate group-hover:text-white transition-colors">
                  {item.summary}
                </p>
                <p className="text-[10px] text-white/30 mt-0.5">{item.time}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors mt-1 shrink-0" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

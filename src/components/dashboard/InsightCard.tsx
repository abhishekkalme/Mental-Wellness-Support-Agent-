'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function InsightCard({
  displayInsight,
  insightLoading,
  insightFailed,
  onRetry,
}: {
  displayInsight: {
    icon: string;
    message: string;
    action: { label: string; href: string } | null;
  } | null;
  insightLoading: boolean;
  insightFailed: boolean;
  onRetry: () => void;
}) {
  if (insightLoading) {
    return (
      <motion.div
        variants={itemVariants}
        className="surface-card p-5 md:p-6 border border-[#E2FF6F]/10"
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#E2FF6F]/30 border-t-[#E2FF6F] rounded-full animate-spin" />
          <p className="text-sm text-white/40">Generating insight...</p>
        </div>
      </motion.div>
    );
  }

  if (!displayInsight && !insightFailed) {
    return (
      <motion.div
        variants={itemVariants}
        className="surface-card p-5 md:p-6 border border-[#E2FF6F]/10"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#E2FF6F]" />
          <p className="text-sm text-white/60">Keep tracking to unlock personalized insights</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      className="surface-card p-5 md:p-6 border border-[#E2FF6F]/10 hover:border-[#E2FF6F]/20 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#E2FF6F]/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-[#E2FF6F]" />
        </div>
        <div className="min-w-0 flex-1">
          {displayInsight ? (
            <>
              <p className="text-sm font-medium text-white leading-relaxed">
                {displayInsight.message}
              </p>
              {displayInsight.action && (
                <Link
                  href={displayInsight.action.href}
                  className="inline-flex items-center gap-1 mt-2 text-xs text-[#E2FF6F] hover:text-[#d4f056] transition-colors font-medium"
                >
                  {displayInsight.action.label} <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </>
          ) : (
            <p className="text-sm text-white/60">
              New insights are being prepared based on your data.
            </p>
          )}
          {insightFailed && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

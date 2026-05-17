'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Brain, AlertTriangle, RefreshCw, Calendar, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

type Density = 'low' | 'medium' | 'high' | 'critical';

type WeekAnalysis = {
  weekStart: string;
  weekEnd: string;
  label: string;
  total: number;
  exams: number;
  deadlines: number;
  lectures: number;
  highPriority: number;
  density: Density;
};

type Summary = {
  totalEvents: number;
  busiestDay: string | null;
  maxEventsPerDay: number;
  upcomingExamDays: { date: string; count: number }[];
  upcomingDeadlineDays: { date: string; count: number }[];
  criticalWeeks: number;
  hasOverload: boolean;
  recommendation: string;
};

type AnalyzeResponse = {
  weeks: WeekAnalysis[];
  summary: Summary;
};

const DENSITY_STYLES: Record<Density, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
  medium: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  high: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  critical: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
};

const DENSITY_LABELS: Record<Density, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export default function AIInsightsPanel() {
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/academic-calendar/analyze?weeks=8');
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: 'Failed to load analysis' }));
        throw new Error(errBody.error || 'Failed to load analysis');
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const { weeks, summary } = data || {};

  return (
    <div className="surface-card mb-6 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
        aria-expanded={expanded}
        aria-label="Toggle AI Workload Insights"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-semibold">AI Workload Insights</span>
          {summary && summary.hasOverload && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
              {summary.criticalWeeks} overloaded
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-white/40" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-white/[0.06]">
              {loading && <InsightsSkeleton />}
              {!loading && error && (
                <div className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-xs text-white/60 flex-1">{error}</p>
                  <button
                    onClick={fetchAnalysis}
                    className="h-8 px-3 rounded-lg bg-white/[0.06] text-white/60 text-xs hover:bg-white/[0.1] transition-colors inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                </div>
              )}
              {!loading && !error && data && weeks && summary && (
                <div className="mt-3 space-y-4">
                  {summary.totalEvents === 0 ? (
                    <div className="flex flex-col items-center py-6 text-center">
                      <Calendar className="w-8 h-8 text-white/15 mb-3" />
                      <p className="text-sm text-white/40">No upcoming events to analyze</p>
                      <p className="text-xs text-white/20 mt-1">
                        Add events to see workload insights
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/50">
                        <span className="text-white/70 font-medium">
                          {summary.totalEvents} events
                        </span>
                        {summary.busiestDay && (
                          <span>
                            Busiest:{' '}
                            <span className="text-white/70">
                              {format(parseISO(summary.busiestDay), 'MMM d')}
                            </span>
                          </span>
                        )}
                        {summary.criticalWeeks > 0 && (
                          <span className="text-red-400">
                            {summary.criticalWeeks} overloaded week
                            {summary.criticalWeeks > 1 ? 's' : ''}
                          </span>
                        )}
                        <button
                          onClick={fetchAnalysis}
                          className="ml-auto text-white/30 hover:text-white/60 transition-colors"
                          aria-label="Refresh analysis"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-sm text-white/60 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
                        {summary.recommendation}
                      </p>

                      <div>
                        <p className="text-[11px] text-white/30 uppercase tracking-wider mb-2.5">
                          Weekly Density
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {weeks.map((week) => {
                            const style = DENSITY_STYLES[week.density];
                            return (
                              <div
                                key={week.weekStart}
                                className={cn(
                                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl border min-w-[72px]',
                                  style.bg,
                                  style.border
                                )}
                              >
                                <span
                                  className={cn('text-[10px] font-semibold uppercase', style.text)}
                                >
                                  {DENSITY_LABELS[week.density]}
                                </span>
                                <span className="text-[11px] text-white/40 whitespace-nowrap">
                                  {week.label === 'This Week'
                                    ? 'Now'
                                    : week.label === 'Next Week'
                                      ? 'Next'
                                      : format(parseISO(week.weekStart), 'M/d')}
                                </span>
                                <span className="text-[10px] text-white/30">
                                  {week.total} events
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {summary.upcomingExamDays.length > 0 && (
                        <div className="flex items-start gap-2.5">
                          <FileText className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-white/50">Upcoming Exams</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {summary.upcomingExamDays.map((d) => (
                                <span
                                  key={d.date}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20"
                                >
                                  {format(parseISO(d.date), 'MMM d')} ({d.count})
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {summary.upcomingDeadlineDays.length > 0 && (
                        <div className="flex items-start gap-2.5">
                          <FileText className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-white/50">Upcoming Deadlines</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {summary.upcomingDeadlineDays.map((d) => (
                                <span
                                  key={d.date}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                >
                                  {format(parseISO(d.date), 'MMM d')} ({d.count})
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="mt-3 animate-pulse space-y-3">
      <div className="h-4 w-48 rounded bg-white/[0.04]" />
      <div className="h-12 rounded-xl bg-white/[0.03]" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 w-[72px] rounded-xl bg-white/[0.03]" />
        ))}
      </div>
    </div>
  );
}

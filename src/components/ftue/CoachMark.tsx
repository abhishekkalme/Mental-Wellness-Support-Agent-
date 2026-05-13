'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface CoachMarkProps {
  step: number;
  total: number;
  title: string;
  description: string;
  targetId: string;
  position?: 'bottom' | 'top' | 'left' | 'right';
  onNext: () => void;
  onPrev?: () => void;
  onDismiss: () => void;
}

export function CoachMark({
  step,
  total,
  title,
  description,
  targetId,
  position = 'bottom',
  onNext,
  onPrev,
  onDismiss,
}: CoachMarkProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  const updatePosition = useCallback(() => {
    const el = document.getElementById(targetId);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    }
  }, [targetId]);

  useEffect(() => {
    setMounted(true);
    updatePosition();
    window.addEventListener('scroll', updatePosition, { capture: true });
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, { capture: true });
      window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition]);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el || !mounted) return;
    const origOutline = el.style.outline;
    const origOutlineOffset = el.style.outlineOffset;
    const origZIndex = el.style.zIndex;
    el.style.outline = '2px solid #E2FF6F';
    el.style.outlineOffset = '2px';
    el.style.zIndex = '60';
    return () => {
      el.style.outline = origOutline;
      el.style.outlineOffset = origOutlineOffset;
      el.style.zIndex = origZIndex;
    };
  }, [targetId, mounted]);

  useEffect(() => {
    if (mounted) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mounted]);

  if (!mounted || !targetRect) return null;

  const tooltipWidth = 320;
  const gap = 14;
  const isMobile = window.innerWidth < 640;

  if (isMobile) {
    return createPortal(
      <>
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onDismiss} />
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-[#141716] border-t border-[#E2FF6F]/20 rounded-t-2xl p-5 pb-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-[#E2FF6F] uppercase tracking-wider">
              Step {step} of {total}
            </span>
            <button
              onClick={onDismiss}
              className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <h4 className="text-white font-bold text-base mb-2">{title}</h4>
          <p className="text-white/50 text-sm leading-relaxed mb-5">{description}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i < step ? 'bg-[#E2FF6F]' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {step > 1 && onPrev && (
                <button
                  onClick={onPrev}
                  className="px-3 py-1.5 rounded-xl bg-white/5 text-white/50 text-sm hover:bg-white/10 transition-all"
                >
                  Back
                </button>
              )}
              <button
                onClick={onNext}
                className="px-4 py-1.5 rounded-xl bg-[#E2FF6F] text-black text-sm font-bold hover:bg-[#d4f056] transition-all"
              >
                {step === total ? 'Done' : 'Next'}
              </button>
            </div>
          </div>
        </motion.div>
      </>,
      document.body
    );
  }

  let top: number;
  let left: number;

  switch (position) {
    case 'top':
      top = targetRect.top - gap;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      break;
    case 'left':
      top = targetRect.top + targetRect.height / 2 - 80;
      left = targetRect.left - gap - tooltipWidth;
      break;
    case 'right':
      top = targetRect.top + targetRect.height / 2 - 80;
      left = targetRect.right + gap;
      break;
    case 'bottom':
    default:
      top = targetRect.bottom + gap;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      break;
  }

  const maxLeft = window.innerWidth - tooltipWidth - 16;
  const minLeft = 16;
  left = Math.max(minLeft, Math.min(left, maxLeft));
  top = Math.max(16, top);

  const willOverflowBottom = top + 300 > window.innerHeight;
  if (willOverflowBottom && position === 'bottom') {
    top = targetRect.top - gap - 220;
  }

  const arrowClass =
    position === 'bottom'
      ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45'
      : position === 'top'
        ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45'
        : position === 'left'
          ? 'top-6 right-0 translate-x-1/2 rotate-45'
          : 'top-6 left-0 -translate-x-1/2 rotate-45';

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onDismiss} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          top,
          left,
          width: tooltipWidth,
          zIndex: 60,
        }}
        className="bg-[#141716] border border-[#E2FF6F]/20 rounded-2xl shadow-2xl p-5"
      >
        <div
          className={`absolute w-3 h-3 bg-[#141716] border-l border-t border-[#E2FF6F]/20 ${arrowClass}`}
        />
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold text-[#E2FF6F] uppercase tracking-wider">
            Step {step} of {total}
          </span>
        </div>
        <h4 className="text-white font-bold text-base mb-2">{title}</h4>
        <p className="text-white/50 text-sm leading-relaxed mb-5">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i < step ? 'bg-[#E2FF6F]' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 1 && onPrev && (
              <button
                onClick={onPrev}
                className="px-3 py-1.5 rounded-xl bg-white/5 text-white/50 text-sm hover:bg-white/10 transition-all"
              >
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="px-4 py-1.5 rounded-xl bg-[#E2FF6F] text-black text-sm font-bold hover:bg-[#d4f056] transition-all"
            >
              {step === total ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

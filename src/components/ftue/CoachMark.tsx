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

// 0 = exact fit around target
// Breathing room around target
const SPOTLIGHT_PAD = 4;

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
      const rect = el.getBoundingClientRect();
      setTargetRect((prev) => {
        if (
          !prev ||
          prev.top !== rect.top ||
          prev.left !== rect.left ||
          prev.width !== rect.width ||
          prev.height !== rect.height
        ) {
          return rect;
        }
        return prev;
      });
    }
  }, [targetId]);

  useEffect(() => {
    setMounted(true);

    let animationId: number;
    const track = () => {
      updatePosition();
      animationId = requestAnimationFrame(track);
    };

    animationId = requestAnimationFrame(track);

    window.addEventListener('scroll', updatePosition, {
      capture: true,
    });

    window.addEventListener('resize', updatePosition);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('scroll', updatePosition, {
        capture: true,
      });
      window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition]);

  // Only raise z-index of target.
  // No outline, no second border.
  useEffect(() => {
    const el = document.getElementById(targetId);

    if (!el || !mounted) return;

    const originalZIndex = el.style.zIndex;
    const originalPosition = el.style.position;

    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }

    el.style.zIndex = '55';

    return () => {
      el.style.zIndex = originalZIndex;
      el.style.position = originalPosition;
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

  // Mobile Bottom Sheet
  if (isMobile) {
    return createPortal(
      <>
        <div className="fixed inset-0 z-50 bg-black/40" onClick={onDismiss} />

        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1],
          }}
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
                  className={`w-1.5 h-1.5 rounded-full ${
                    i < step ? 'bg-[#E2FF6F]' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step > 1 && onPrev && (
                <button
                  onClick={onPrev}
                  className="px-3 py-1.5 rounded-xl bg-white/5 text-white/50 text-sm"
                >
                  Back
                </button>
              )}

              <button
                onClick={onNext}
                className="px-4 py-1.5 rounded-xl bg-[#E2FF6F] text-black text-sm font-bold"
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

  // Desktop Tooltip Position
  let top: number;
  let left: number;

  switch (position) {
    case 'top':
      top = targetRect.top - gap - 220;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
      break;

    case 'left':
      top = targetRect.top + targetRect.height / 2 - 80;
      left = targetRect.left - tooltipWidth - gap;
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

  left = Math.max(16, Math.min(left, maxLeft));

  top = Math.max(16, top);

  const arrowClass =
    position === 'bottom'
      ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45'
      : position === 'top'
        ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45'
        : position === 'left'
          ? 'top-6 right-0 translate-x-1/2 rotate-45'
          : 'top-6 left-0 -translate-x-1/2 rotate-45';

  // Exact spotlight dimensions
  const spotlightX = targetRect.left - SPOTLIGHT_PAD;

  const spotlightY = targetRect.top - SPOTLIGHT_PAD;

  const spotlightW = targetRect.width + SPOTLIGHT_PAD * 2;

  const spotlightH = targetRect.height + SPOTLIGHT_PAD * 2;

  return createPortal(
    <AnimatePresence>
      <>
        {/* Background Overlay */}
        <div className="fixed inset-0 z-50 pointer-events-none">
          <svg className="w-full h-full" aria-hidden="true">
            <defs>
              <mask id={`spotlight-${step}`}>
                <rect width="100%" height="100%" fill="white" />

                <rect
                  x={spotlightX}
                  y={spotlightY}
                  width={spotlightW}
                  height={spotlightH}
                  fill="black"
                  rx="16"
                />
              </mask>
            </defs>

            <rect
              width="100%"
              height="100%"
              fill="rgba(0,0,0,0.45)"
              mask={`url(#spotlight-${step})`}
            />
          </svg>
        </div>

        {/* Single Glow Box */}
        <div
          className="fixed z-[51] pointer-events-none"
          style={{
            left: spotlightX,
            top: spotlightY,
            width: spotlightW,
            height: spotlightH,
            borderRadius: 16,
            boxShadow: '0 0 0 2px rgba(226,255,111,0.8)',
          }}
        />

        {/* Tooltip */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
            y: -8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: -8,
          }}
          transition={{
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
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
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/30"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <span className="text-[10px] font-bold text-[#E2FF6F] uppercase tracking-wider">
            Step {step} of {total}
          </span>

          <h4 className="text-white font-bold text-base mt-3 mb-2">{title}</h4>

          <p className="text-white/50 text-sm leading-relaxed mb-5">{description}</p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i < step ? 'bg-[#E2FF6F]' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {step > 1 && onPrev && (
                <button
                  onClick={onPrev}
                  className="px-3 py-1.5 rounded-xl bg-white/5 text-white/50 text-sm"
                >
                  Back
                </button>
              )}

              <button
                onClick={onNext}
                className="px-4 py-1.5 rounded-xl bg-[#E2FF6F] text-black text-sm font-bold"
              >
                {step === total ? 'Done' : 'Next'}
              </button>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>,
    document.body
  );
}

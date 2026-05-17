'use client';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0C0B]">
      <div className="relative">
        <div className="absolute inset-0 bg-[#E2FF6F] blur-2xl rounded-full motion-reduce:hidden" />
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-[#E2FF6F]/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-[#E2FF6F] rounded-full motion-reduce:animate-none motion-reduce:border-t-transparent animate-spin" />
        </div>
      </div>
      <p className="mt-6 text-[#E2FF6F] text-xs font-bold uppercase tracking-[0.3em]">
        MindCare Initializing
      </p>
    </div>
  );
}

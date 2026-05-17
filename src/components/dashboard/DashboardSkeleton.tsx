'use client';

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0C0B]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-4 md:pt-6 space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-7 w-56 bg-white/5 rounded-lg" />
            <div className="h-4 w-32 bg-white/5 rounded-lg" />
          </div>
          <div className="h-9 w-24 bg-white/5 rounded-full" />
        </div>
        <div className="h-36 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-56 bg-white/5 rounded-2xl" />
          <div className="h-56 bg-white/5 rounded-2xl" />
        </div>
        <div className="h-28 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-5 gap-3">
          <div className="h-24 bg-white/5 rounded-2xl" />
          <div className="h-24 bg-white/5 rounded-2xl" />
          <div className="h-24 bg-white/5 rounded-2xl" />
          <div className="h-24 bg-white/5 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

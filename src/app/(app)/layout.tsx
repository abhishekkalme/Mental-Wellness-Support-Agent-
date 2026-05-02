"use client";

import { Sidebar } from "@/components/Sidebar";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Menu, X } from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOnboarding = pathname === "/onboarding";
  const syncRemoteData = useStore((state) => state.syncRemoteData);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    syncRemoteData();
  }, [syncRemoteData]);

  // Close sidebar on path change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#0A0C0B] relative overflow-hidden">
      {/* Universal Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
         <Image 
           src="/assets/images/forest-bg.png"
           alt="Background"
           fill
           className="object-cover blur-[80px] scale-110"
         />
      </div>

      {/* Mobile Header / Nav Toggle */}
      {!isOnboarding && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 bg-black/50 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E2FF6F] rounded-lg flex items-center justify-center">
              <span className="font-bold text-black text-sm">MC</span>
            </div>
            <span className="font-bold text-white tracking-tight">MindCare</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      )}

      {!isOnboarding && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
      <div className={`flex-1 ${!isOnboarding ? 'md:pl-72' : ''} pt-16 md:pt-0 relative z-10 transition-all duration-500`}>
        <div className="min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}

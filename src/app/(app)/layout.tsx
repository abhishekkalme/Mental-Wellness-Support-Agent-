"use client";

import { Sidebar } from "@/components/Sidebar";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOnboarding = pathname === "/onboarding";
  const syncRemoteData = useStore((state) => state.syncRemoteData);

  useEffect(() => {
    syncRemoteData();
  }, [syncRemoteData]);

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

      {!isOnboarding && <Sidebar />}
      <div className={`flex-1 ${!isOnboarding ? 'pl-72' : ''} relative z-10 transition-all duration-500`}>
        <div className="min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}

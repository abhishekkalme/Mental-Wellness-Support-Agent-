'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/agent-chat');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0D08] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E2FF6F] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

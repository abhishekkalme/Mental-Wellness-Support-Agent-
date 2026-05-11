'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0D08] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E2FF6F]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-40 left-0 w-80 h-80 bg-[#E2FF6F]/3 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-2"
        >
          <div className="text-[120px] font-black text-[#E2FF6F]/10 leading-none select-none">
            404
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Page Not Found</h1>
          <p className="text-white/50 text-lg font-medium">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="h-14 px-8 rounded-2xl border-white/10 text-white hover:bg-white/10 hover:text-white font-bold gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Go Back
          </Button>
          <Link href="/dashboard">
            <Button className="h-14 px-8 rounded-2xl bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold gap-2 shadow-xl shadow-[#E2FF6F]/10">
              <Home className="w-5 h-5" /> Go to Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, ArrowRight } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function GuestPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const result = await signIn("guest", {
        name: name.trim(),
        redirect: false,
      });
      if (result?.ok) {
        router.push("/onboarding");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -z-10" />

      <Link
        href="/"
        className="absolute top-6 left-6 font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
      >
        <ArrowRight className="w-4 h-4 rotate-180" /> Back to home
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-panel p-8 text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Brain className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Try MindCare as a guest</h1>
            <p className="text-sm text-muted-foreground text-balance">
              Your session stays on this device. Sign up anytime to save progress, community access, and bookings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium ml-1">
                What should we call you?
              </label>
              <Input
                id="name"
                placeholder="E.g. Alex"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <Button type="submit" className="w-full md:mt-4" disabled={loading}>
              {loading ? "Starting…" : "Continue"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground">
            Want a full account?{" "}
            <Link href="/signup" className="text-foreground font-medium underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

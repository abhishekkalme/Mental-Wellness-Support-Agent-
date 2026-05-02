"use client";

import { motion } from "framer-motion";
import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, ArrowRight } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }
      if (result?.ok) {
        router.push("/dashboard");
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
            <h1 className="text-2xl font-semibold tracking-tight">Sign in to MindCare</h1>
            <p className="text-sm text-muted-foreground">
              Use the email and password you registered with.
            </p>
          </div>

          {registered && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 w-full text-left">
              Account created. You can sign in now.
            </p>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium ml-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium ml-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full md:mt-4" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground w-full">
            <p>
              New here?{" "}
              <Link href="/signup" className="text-foreground font-medium underline-offset-4 hover:underline">
                Create an account
              </Link>
            </p>
            <p>
              Prefer a quick look?{" "}
              <Link href="/guest" className="text-foreground font-medium underline-offset-4 hover:underline">
                Continue as guest
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
          Loading…
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}

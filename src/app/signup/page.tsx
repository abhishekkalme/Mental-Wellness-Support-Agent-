"use client";

import { motion } from "framer-motion";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, ArrowRight } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not create account.");
        return;
      }
      const signed = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (signed?.error) {
        router.push("/signin?registered=1");
        return;
      }
      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
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
            <h1 className="text-2xl font-semibold tracking-tight">Create your MindCare account</h1>
            <p className="text-sm text-muted-foreground">
              Next you&apos;ll complete onboarding so we can personalize support.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium ml-1">
                Full name
              </label>
              <Input
                id="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
                Password (min 8 characters)
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <Button type="submit" className="w-full md:mt-4" disabled={loading}>
              {loading ? "Creating account…" : "Sign up"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="text-foreground font-medium underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

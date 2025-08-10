"use client";

import React, { useState } from "react";
import { API_BASE } from "../../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Signup failed");
      if (data?.needsVerification) {
        setMessage("Check your email to verify your account, then sign in.");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a174e] via-[#1e40af] to-[#3b82f6] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/95 backdrop-blur border border-white/20 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/icons/HackOps_Logo.svg"
              alt="HackOps Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
            <span className="text-3xl font-bold text-[#0a174e]">HackOps</span>
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Create account</h1>
          <p className="text-sm text-neutral-600">Join HackOps to manage your event</p>
        </div>
        {message && (
          <div className="mb-6 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all duration-200 bg-white/50"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:border-transparent transition-all duration-200 bg-white/50"
              placeholder="Minimum 6 characters"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white rounded-lg py-3 font-semibold hover:from-[#183084] hover:to-[#2563eb] transition-all duration-200 disabled:opacity-60 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating account…
              </div>
            ) : (
              "Create account"
            )}
          </button>
        </form>
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <p className="text-center text-sm text-neutral-600">
            Already have an account?{" "}
            <Link href="/login" className="text-[#1e40af] hover:text-[#3b82f6] font-medium hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

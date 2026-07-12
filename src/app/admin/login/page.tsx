"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Wrong password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-4">
          <button
            onClick={toggle}
            className="p-2 rounded-xl bg-card border border-border hover:bg-border transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted text-sm mt-1">Enter password to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 mt-6 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to gallery
        </Link>
      </div>
    </div>
  );
}

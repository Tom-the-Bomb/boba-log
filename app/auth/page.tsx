"use client";

import { SITE_NAME } from "@/lib/site";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SubmitEventHandler } from "react";
import { useEffect, useState } from "react";
import { useUser } from "../providers/user-provider";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const { user, isLoadingUser, login } = useUser();
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoadingUser && user) {
      router.replace("/app");
    }
  }, [isLoadingUser, router, user]);

  async function handleSubmit(
    event: Parameters<SubmitEventHandler<HTMLFormElement>>[0],
  ) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, username, password }),
      });

      const data = (await response.json()) as {
        error?: string;
        token?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Authentication failed.");
        return;
      }

      await login(data.token!);
      router.push("/app");
    } catch {
      setError("Could not connect to server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="tea-grid-bg flex min-h-screen flex-col">
      <div className="tea-line tea-page-padding-sm" />

      <main className="tea-page-padding-sm flex flex-1 items-center justify-center py-16">
        <section className="w-full max-w-sm" aria-label="Authentication">
          <div className="mb-10">
            <p className="tea-text-accent text-xs tracking-[0.3em] uppercase">
              {mode === "login" ? "Welcome back" : `Join ${SITE_NAME}`}
            </p>
            <h1 className="font-display tea-text-primary mt-3 text-4xl font-medium tracking-tight">
              {mode === "login" ? "Sign in" : "Create account"}
            </h1>
          </div>

          <div className="tea-border-subtle mb-8 flex gap-6 border-b">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`tea-auth-tab ${
                mode === "login"
                  ? "tea-border-strong tea-text-primary border-b-2"
                  : "tea-text-muted tea-hover-text-primary"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`tea-auth-tab ${
                mode === "signup"
                  ? "tea-border-strong tea-text-primary border-b-2"
                  : "tea-text-muted tea-hover-text-primary"
              }`}
            >
              Signup
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="auth-username"
                className="tea-text-muted tea-auth-form-label"
              >
                Username
              </label>
              <input
                id="auth-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="tea-text-primary tea-border-accent-focus tea-border-subtle tea-input-line transition-colors"
                required
                minLength={3}
              />
            </div>
            <div>
              <label
                htmlFor="auth-password"
                className="tea-text-muted tea-auth-form-label"
              >
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="tea-text-primary tea-border-accent-focus tea-border-subtle tea-input-line transition-colors"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-xs tracking-wide text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="tea-cta mt-4 w-full py-3.5 text-xs tracking-[0.2em] uppercase disabled:opacity-50"
            >
              {isSubmitting
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>
        </section>
      </main>

      <div className="tea-line tea-line-bottom tea-page-padding-sm" />
      <footer className="tea-page-padding-sm flex items-center justify-between py-6">
        <p className="tea-text-muted tea-caps-10-wide">{SITE_NAME}</p>
        <Link href="/" className="tea-link text-[10px]">
          &larr; Home
        </Link>
      </footer>
    </div>
  );
}

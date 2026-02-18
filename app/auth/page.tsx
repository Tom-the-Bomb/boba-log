"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SubmitEventHandler } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "../providers/user-provider";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const { user, isLoadingUser, login } = useUser();
  const { t } = useTranslation("auth");
  const { t: tc } = useTranslation("common");
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateUsername(value: string) {
    const normalized = value.trim();
    if (!normalized) {
      return t("usernameRequired");
    }
    if (mode === "signup" && normalized.length < 3) {
      return t("usernameMinLength");
    }
    return "";
  }

  function validatePassword(value: string) {
    if (!value) {
      return t("passwordRequired");
    }
    if (mode === "signup" && value.length < 6) {
      return t("passwordMinLength");
    }
    return "";
  }

  useEffect(() => {
    if (!isLoadingUser && user && window.location.pathname !== "/app") {
      router.replace("/app");
    }
  }, [isLoadingUser, router, user]);

  async function handleSubmit(
    event: Parameters<SubmitEventHandler<HTMLFormElement>>[0],
  ) {
    event.preventDefault();

    const nextUsernameError = validateUsername(username);
    const nextPasswordError = validatePassword(password);
    setUsernameError(nextUsernameError);
    setPasswordError(nextPasswordError);

    if (nextUsernameError || nextPasswordError) {
      setError("");
      return;
    }

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
        setError(data.error ?? t("authFailed"));
        return;
      }

      await login(data.token!);
      router.push("/app");
    } catch {
      setError(t("connectionError"));
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
              {mode === "login"
                ? t("welcomeBack")
                : t("joinSite", { siteName: tc("siteName") })}
            </p>
            <h1 className="tea-text-primary mt-3 font-display text-4xl font-medium tracking-tight">
              {mode === "login" ? t("signInTitle") : t("createAccountTitle")}
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
              {t("loginTab")}
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
              {t("signupTab")}
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="auth-username"
                className="tea-text-muted tea-auth-form-label"
              >
                {t("username")}
              </label>
              <input
                id="auth-username"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  if (usernameError) {
                    setUsernameError("");
                  }
                }}
                className={`tea-text-primary tea-border-accent-focus tea-border-subtle tea-input-line transition-colors ${
                  usernameError ? "tea-input-error" : ""
                }`}
                aria-describedby={
                  usernameError ? "auth-username-error" : undefined
                }
              />
              {usernameError && (
                <p
                  id="auth-username-error"
                  className="tea-form-error"
                  role="alert"
                >
                  {usernameError}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="auth-password"
                className="tea-text-muted tea-auth-form-label"
              >
                {t("password")}
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (passwordError) {
                      setPasswordError("");
                    }
                  }}
                  className={`tea-text-primary tea-border-accent-focus tea-border-subtle tea-input-line pr-10 transition-colors ${
                    passwordError ? "tea-input-error" : ""
                  }`}
                  aria-describedby={
                    passwordError ? "auth-password-error" : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="tea-text-muted tea-hover-text-primary absolute right-0 bottom-2.5 p-1 transition-colors"
                  aria-label={
                    showPassword ? t("hidePassword") : t("showPassword")
                  }
                >
                  {password &&
                    (showPassword ? (
                      <Eye className="h-4.5 w-4.5" />
                    ) : (
                      <EyeOff className="h-4.5 w-4.5" />
                    ))}
                </button>
              </div>
              {passwordError && (
                <p
                  id="auth-password-error"
                  className="tea-form-error"
                  role="alert"
                >
                  {passwordError}
                </p>
              )}
            </div>

            {error && (
              <p className="tea-form-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="tea-cta mt-4 w-full py-3.5 text-xs tracking-[0.2em] uppercase disabled:opacity-50"
            >
              {isSubmitting
                ? t("pleaseWait")
                : mode === "login"
                  ? t("signInButton")
                  : t("createAccountButton")}
            </button>
          </form>
        </section>
      </main>

      <div className="tea-line tea-line-bottom tea-page-padding-sm" />
      <footer className="tea-page-padding-sm flex items-center justify-between py-6">
        <p className="tea-text-muted tea-caps-10-wide">{tc("siteName")}</p>
        <Link href="/" className="tea-link text-[10px]">
          &larr; {tc("home")}
        </Link>
      </footer>
    </div>
  );
}

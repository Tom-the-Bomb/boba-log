"use client";

import { AuthMode } from "@/lib/api/auth";
import type { ApiErrorResponse } from "@/lib/types";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SubmitEventHandler } from "react";
import { useEffect, useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../providers/theme-provider";
import { useUser } from "../providers/user-provider";

interface FormState {
  mode: AuthMode;
  username: string;
  password: string;
  usernameError: string;
  passwordError: string;
  error: string;
  showPassword: boolean;
  isSubmitting: boolean;
  turnstileToken: string;
}

type FormAction =
  | { type: "set_mode"; mode: AuthMode }
  | { type: "set_username"; value: string }
  | { type: "set_password"; value: string }
  | { type: "set_validation"; usernameError: string; passwordError: string }
  | { type: "set_error"; error: string }
  | { type: "toggle_password" }
  | { type: "submit_start" }
  | { type: "submit_end" }
  | { type: "reset_turnstile" }
  | { type: "set_turnstile"; token: string };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "set_mode":
      return { ...state, mode: action.mode, turnstileToken: "" };
    case "set_username":
      return {
        ...state,
        username: action.value,
        usernameError: state.usernameError ? "" : state.usernameError,
      };
    case "set_password":
      return {
        ...state,
        password: action.value,
        passwordError: state.passwordError ? "" : state.passwordError,
      };
    case "set_validation":
      return {
        ...state,
        usernameError: action.usernameError,
        passwordError: action.passwordError,
        error: "",
      };
    case "set_error":
      return { ...state, error: action.error, turnstileToken: "" };
    case "toggle_password":
      return { ...state, showPassword: !state.showPassword };
    case "submit_start":
      return { ...state, isSubmitting: true, error: "" };
    case "submit_end":
      return { ...state, isSubmitting: false, turnstileToken: "" };
    case "reset_turnstile":
      return { ...state, turnstileToken: "" };
    case "set_turnstile":
      return { ...state, turnstileToken: action.token };
  }
}

const INITIAL_FORM_STATE: FormState = {
  mode: "login",
  username: "",
  password: "",
  usernameError: "",
  passwordError: "",
  error: "",
  showPassword: false,
  isSubmitting: false,
  turnstileToken: "",
};

export default function AuthPage() {
  const router = useRouter();
  const { login } = useUser();
  const { isDark } = useTheme();
  const { t } = useTranslation("auth");
  const { t: tc } = useTranslation("common");
  const [form, dispatch] = useReducer(formReducer, INITIAL_FORM_STATE);
  const turnstileRef = useRef<TurnstileInstance>(null);

  function validateUsername(value: string) {
    const normalized = value.trim();
    if (!normalized) {
      return t("usernameRequired");
    }
    if (form.mode === "signup" && normalized.length < 3) {
      return t("usernameMinLength");
    }
    return "";
  }

  function validatePassword(value: string) {
    if (!value) {
      return t("passwordRequired");
    }
    if (form.mode === "signup" && value.length < 6) {
      return t("passwordMinLength");
    }
    return "";
  }

  useEffect(() => {
    turnstileRef.current?.reset();
  }, [form.mode]);

  async function handleSubmit(
    event: Parameters<SubmitEventHandler<HTMLFormElement>>[0],
  ) {
    event.preventDefault();

    const nextUsernameError = validateUsername(form.username);
    const nextPasswordError = validatePassword(form.password);
    dispatch({
      type: "set_validation",
      usernameError: nextUsernameError,
      passwordError: nextPasswordError,
    });

    if (nextUsernameError || nextPasswordError) {
      return;
    }

    dispatch({ type: "submit_start" });

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: form.mode,
          username: form.username,
          password: form.password,
          turnstileToken: form.turnstileToken,
        }),
      });

      const data = (await response.json()) as ApiErrorResponse;
      if (!response.ok) {
        dispatch({
          type: "set_error",
          error: data.code ? t(data.code) : t("authFailed"),
        });
        turnstileRef.current?.reset();
        return;
      }

      await login();
      router.push("/app");
    } catch {
      dispatch({ type: "set_error", error: t("connectionError") });
    } finally {
      dispatch({ type: "submit_end" });
      turnstileRef.current?.reset();
    }
  }

  return (
    <div className="tea-grid-bg flex min-h-screen flex-col">
      <div className="tea-line tea-page-padding-sm" />

      <main className="tea-page-padding-sm flex flex-1 items-center justify-center py-16">
        <section className="w-full max-w-sm" aria-label="Authentication">
          <div className="mb-10">
            <p className="tea-text-accent text-xs tracking-[0.3em] uppercase">
              {form.mode === "login"
                ? t("welcomeBack")
                : t("joinSite", { siteName: tc("siteName") })}
            </p>
            <h1 className="tea-text-primary mt-3 font-display text-4xl font-medium tracking-tight">
              {form.mode === "login"
                ? t("signInTitle")
                : t("createAccountTitle")}
            </h1>
          </div>

          <div className="tea-border-subtle mb-8 flex gap-6 border-b">
            <button
              type="button"
              onClick={() => dispatch({ type: "set_mode", mode: "login" })}
              className={`tea-auth-tab ${
                form.mode === "login"
                  ? "tea-border-strong tea-text-primary border-b-2"
                  : "tea-text-muted tea-hover-text-primary"
              }`}
            >
              {t("loginTab")}
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "set_mode", mode: "signup" })}
              className={`tea-auth-tab ${
                form.mode === "signup"
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
                value={form.username}
                onChange={(event) =>
                  dispatch({ type: "set_username", value: event.target.value })
                }
                className={`tea-text-primary tea-border-accent-focus tea-border-subtle tea-input-line transition-colors ${
                  form.usernameError ? "tea-input-error" : ""
                }`}
                aria-describedby={
                  form.usernameError ? "auth-username-error" : undefined
                }
              />
              {form.usernameError && (
                <p
                  id="auth-username-error"
                  className="tea-form-error"
                  role="alert"
                >
                  {form.usernameError}
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
                  type={form.showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) =>
                    dispatch({
                      type: "set_password",
                      value: event.target.value,
                    })
                  }
                  className={`tea-text-primary tea-border-accent-focus tea-border-subtle tea-input-line pr-10 transition-colors ${
                    form.passwordError ? "tea-input-error" : ""
                  }`}
                  aria-describedby={
                    form.passwordError ? "auth-password-error" : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => dispatch({ type: "toggle_password" })}
                  className="tea-text-muted tea-hover-text-primary absolute right-0 bottom-2.5 p-1 transition-colors"
                  aria-label={
                    form.showPassword ? t("hidePassword") : t("showPassword")
                  }
                >
                  {form.password &&
                    (form.showPassword ? (
                      <Eye className="h-4.5 w-4.5" />
                    ) : (
                      <EyeOff className="h-4.5 w-4.5" />
                    ))}
                </button>
              </div>
              {form.passwordError && (
                <p
                  id="auth-password-error"
                  className="tea-form-error"
                  role="alert"
                >
                  {form.passwordError}
                </p>
              )}
            </div>

            <div className="flex justify-center">
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={(token) =>
                  dispatch({ type: "set_turnstile", token })
                }
                onError={() => dispatch({ type: "reset_turnstile" })}
                onExpire={() => dispatch({ type: "reset_turnstile" })}
                options={{ theme: isDark ? "dark" : "light", size: "normal" }}
              />
            </div>

            {form.error && (
              <p className="tea-form-error" role="alert">
                {form.error}
              </p>
            )}

            <button
              type="submit"
              disabled={form.isSubmitting || !form.turnstileToken}
              className="tea-cta mt-4 w-full py-3.5 text-xs tracking-[0.2em] uppercase disabled:opacity-50"
            >
              {form.isSubmitting
                ? t("pleaseWait")
                : form.mode === "login"
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

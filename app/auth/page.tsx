"use client";

import { failureCode } from "@/lib/network";
import { waitForToken } from "@/lib/turnstile";
import type { ApiErrorResponse, AuthMode } from "@/lib/types";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ChangeEvent, SubmitEventHandler } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";
import { Segmented } from "../components/ui/fields";
import { useUser } from "../providers/user-provider";
import useAuthFormReducer from "../reducers/auth-form-reducer";

/** The message key for what's wrong with a username, or null. */
function usernameProblem(value: string, mode: AuthMode) {
  const normalized = value.trim();
  if (!normalized) {
    return "usernameRequired";
  }
  return mode === "signup" && normalized.length < 3
    ? "usernameMinLength"
    : null;
}

/** The message key for what's wrong with a password, or null. */
function passwordProblem(value: string, mode: AuthMode) {
  if (!value) {
    return "passwordRequired";
  }
  return mode === "signup" && value.length < 6 ? "passwordMinLength" : null;
}

function FieldError({ id, message }: { id: string; message: string }) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} className="mt-2 text-sm text-danger" role="alert">
      {message}
    </p>
  );
}

interface PasswordInputProps {
  value: string;
  visible: boolean;
  autoComplete: string;
  error: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onToggle: () => void;
}

function PasswordInput({
  value,
  visible,
  autoComplete,
  error,
  onChange,
  onToggle,
}: PasswordInputProps) {
  const { t } = useTranslation("auth");
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <input
        id="auth-password"
        type={visible ? "text" : "password"}
        value={value}
        autoComplete={autoComplete}
        onChange={onChange}
        className="field h-11 pr-11"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "auth-password-error" : undefined}
      />
      {value && (
        <button
          type="button"
          onClick={onToggle}
          className="tap-target absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-md text-text-2 hover:text-text"
          aria-label={visible ? t("hidePassword") : t("showPassword")}
        >
          <Icon size={17} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const { login } = useUser();
  const { t } = useTranslation("auth");
  const [form, dispatch] = useAuthFormReducer();
  const turnstileRef = useRef<TurnstileInstance>(null);

  async function handleSubmit(
    event: Parameters<SubmitEventHandler<HTMLFormElement>>[0],
  ) {
    event.preventDefault();

    const usernameKey = usernameProblem(form.username, form.mode);
    const passwordKey = passwordProblem(form.password, form.mode);
    dispatch({
      type: "set_validation",
      usernameError: usernameKey ? t(usernameKey) : "",
      passwordError: passwordKey ? t(passwordKey) : "",
    });

    if (usernameKey || passwordKey) {
      return;
    }

    dispatch({ type: "submit_start" });

    try {
      const token = await waitForToken(turnstileRef, form.turnstileToken);
      if (!token) {
        dispatch({ type: "set_error", error: t("turnstileTimeout") });
        turnstileRef.current?.reset();
        return;
      }
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: form.mode,
          username: form.username,
          password: form.password,
          turnstileToken: token,
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
      router.push("/dashboard");
    } catch {
      dispatch({ type: "set_error", error: t(failureCode("connectionError")) });
    } finally {
      dispatch({ type: "submit_end" });
      turnstileRef.current?.reset();
    }
  }

  const isLogin = form.mode === "login";

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex flex-1 items-start justify-center px-4 pt-10 pb-20 sm:items-center sm:pt-0">
        <section className="w-full max-w-sm" aria-labelledby="auth-heading">
          <h1 id="auth-heading" className="font-kai text-4xl text-text">
            {isLogin ? t("welcomeBack") : t("createAccountTitle")}
          </h1>

          <Segmented
            className="mt-8"
            label={t("welcomeBack")}
            value={form.mode}
            options={[
              { value: "login", label: t("loginTab") },
              { value: "signup", label: t("signupTab") },
            ]}
            onChange={(mode) => dispatch({ type: "set_mode", mode })}
          />

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="auth-username" className="label">
                {t("username")}
              </label>
              <input
                id="auth-username"
                value={form.username}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                onChange={(event) =>
                  dispatch({ type: "set_username", value: event.target.value })
                }
                className="field h-11"
                aria-invalid={form.usernameError ? true : undefined}
                aria-describedby={
                  form.usernameError ? "auth-username-error" : undefined
                }
              />
              <FieldError
                id="auth-username-error"
                message={form.usernameError}
              />
            </div>
            <div>
              <label htmlFor="auth-password" className="label">
                {t("password")}
              </label>
              <PasswordInput
                value={form.password}
                visible={form.showPassword}
                autoComplete={isLogin ? "current-password" : "new-password"}
                error={form.passwordError}
                onChange={(event) =>
                  dispatch({ type: "set_password", value: event.target.value })
                }
                onToggle={() => dispatch({ type: "toggle_password" })}
              />
              <FieldError
                id="auth-password-error"
                message={form.passwordError}
              />
            </div>

            {/* Runs unseen and never needs a person, so it stays out of the tab order. */}
            <div inert>
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onSuccess={(token) =>
                  dispatch({ type: "set_turnstile", token })
                }
                onError={() => dispatch({ type: "reset_turnstile" })}
                onExpire={() => dispatch({ type: "reset_turnstile" })}
                options={{ size: "invisible" }}
                className="h-0 overflow-hidden"
              />
            </div>

            {form.error && (
              <p className="text-sm text-danger" role="alert">
                {form.error}
              </p>
            )}

            <button
              type="submit"
              disabled={form.isSubmitting}
              className="btn btn-primary h-11 w-full"
            >
              {t(
                form.isSubmitting
                  ? "pleaseWait"
                  : isLogin
                    ? "signInButton"
                    : "createAccountButton",
              )}
            </button>
          </form>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

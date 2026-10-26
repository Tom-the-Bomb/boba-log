"use client";

import { failureCode } from "@/lib/network";
import { waitForToken } from "@/lib/turnstile";
import type { ApiErrorResponse } from "@/lib/types";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SubmitEventHandler } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";
import { Segmented } from "../components/ui/fields";
import { useUser } from "../providers/user-provider";
import useAuthFormReducer from "../reducers/auth-form-reducer";

export default function AuthPage() {
  const router = useRouter();
  const { login } = useUser();
  const { t } = useTranslation("auth");
  const [form, dispatch] = useAuthFormReducer();
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
              {form.usernameError && (
                <p
                  id="auth-username-error"
                  className="mt-2 text-sm text-danger"
                  role="alert"
                >
                  {form.usernameError}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="auth-password" className="label">
                {t("password")}
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={form.showPassword ? "text" : "password"}
                  value={form.password}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  onChange={(event) =>
                    dispatch({
                      type: "set_password",
                      value: event.target.value,
                    })
                  }
                  className="field h-11 pr-11"
                  aria-invalid={form.passwordError ? true : undefined}
                  aria-describedby={
                    form.passwordError ? "auth-password-error" : undefined
                  }
                />
                {form.password && (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "toggle_password" })}
                    className="tap-target absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-md text-text-2 hover:text-text"
                    aria-label={
                      form.showPassword ? t("hidePassword") : t("showPassword")
                    }
                  >
                    {form.showPassword ? (
                      <EyeOff size={17} strokeWidth={1.5} />
                    ) : (
                      <Eye size={17} strokeWidth={1.5} />
                    )}
                  </button>
                )}
              </div>
              {form.passwordError && (
                <p
                  id="auth-password-error"
                  className="mt-2 text-sm text-danger"
                  role="alert"
                >
                  {form.passwordError}
                </p>
              )}
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
              {form.isSubmitting
                ? t("pleaseWait")
                : isLogin
                  ? t("signInButton")
                  : t("createAccountButton")}
            </button>
          </form>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

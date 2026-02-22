"use client";

import { waitForToken } from "@/lib/turnstile";
import type { ApiErrorResponse } from "@/lib/types";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SubmitEventHandler } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import AuthFooter from "../components/auth/footer";
import { useUser } from "../providers/user-provider";
import useAuthFormReducer from "../reducers/auth-form-reducer";

export default function AuthPage() {
  const router = useRouter();
  const { login } = useUser();
  const { t } = useTranslation("auth");
  const { t: tc } = useTranslation("common");
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
            <p className="text-xs tracking-[0.3em] text-tea-sage uppercase">
              {form.mode === "login"
                ? t("welcomeBack")
                : t("joinSite", { siteName: tc("siteName") })}
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-tea-charcoal">
              {form.mode === "login"
                ? t("signInTitle")
                : t("createAccountTitle")}
            </h1>
          </div>

          <div className="mb-8 flex gap-6 border-b border-tea-stone">
            <button
              type="button"
              onClick={() => dispatch({ type: "set_mode", mode: "login" })}
              className={`tea-auth-tab ${
                form.mode === "login"
                  ? "border-b-2 border-tea-charcoal text-tea-charcoal"
                  : "text-tea-faint hover:text-tea-charcoal"
              }`}
            >
              {t("loginTab")}
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "set_mode", mode: "signup" })}
              className={`tea-auth-tab ${
                form.mode === "signup"
                  ? "border-b-2 border-tea-charcoal text-tea-charcoal"
                  : "text-tea-faint hover:text-tea-charcoal"
              }`}
            >
              {t("signupTab")}
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="auth-username" className="tea-auth-form-label">
                {t("username")}
              </label>
              <input
                id="auth-username"
                value={form.username}
                onChange={(event) =>
                  dispatch({ type: "set_username", value: event.target.value })
                }
                className={`tea-input-line ${
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
              <label htmlFor="auth-password" className="tea-auth-form-label">
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
                  className={`tea-input-line pr-10 ${
                    form.passwordError ? "tea-input-error" : ""
                  }`}
                  aria-describedby={
                    form.passwordError ? "auth-password-error" : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => dispatch({ type: "toggle_password" })}
                  className="absolute right-0 bottom-2.5 p-1 text-tea-faint transition-colors hover:text-tea-charcoal"
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

            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => dispatch({ type: "set_turnstile", token })}
              onError={() => dispatch({ type: "reset_turnstile" })}
              onExpire={() => dispatch({ type: "reset_turnstile" })}
              options={{ size: "invisible" }}
              className="-mt-6"
            />

            {form.error && (
              <p className="tea-form-error" role="alert">
                {form.error}
              </p>
            )}

            <button
              type="submit"
              disabled={form.isSubmitting}
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

      <AuthFooter />
    </div>
  );
}

"use client";

import { MAX_USERNAME_LENGTH } from "@/lib/drinks";
import { failureCode, sendJson } from "@/lib/network";
import { waitForToken } from "@/lib/turnstile";
import type { AuthMode } from "@/lib/types";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import InvisibleTurnstile from "../components/invisible-turnstile";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";
import { FormError, Segmented } from "../components/ui/fields";
import useAuthFormReducer from "../reducers/auth-form-reducer";

function usernameProblem(value: string, mode: AuthMode) {
  const normalized = value.trim();
  if (!normalized) {
    return "usernameRequired";
  }
  if (mode === "login") {
    return null;
  }
  if (normalized.length < 3) {
    return "usernameMinLength";
  }
  return normalized.length > MAX_USERNAME_LENGTH ? "usernameMaxLength" : null;
}

function passwordProblem(value: string, mode: AuthMode) {
  if (!value) {
    return "passwordRequired";
  }
  return mode === "signup" && value.length < 6 ? "passwordMinLength" : null;
}

export default function AuthPage() {
  const router = useRouter();
  const { t } = useTranslation("auth");
  const [form, dispatch] = useAuthFormReducer();
  const turnstileRef = useRef<TurnstileInstance>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      const token = await waitForToken(turnstileRef);
      if (!token) {
        dispatch({ type: "set_error", error: t("turnstileTimeout") });
        return;
      }
      const { ok, data } = await sendJson("/api/auth", "POST", {
        mode: form.mode,
        username: form.username,
        password: form.password,
        turnstileToken: token,
      });
      if (!ok) {
        dispatch({ type: "set_error", error: t(data.code ?? "authFailed") });
        return;
      }
      router.replace("/dashboard");
    } catch {
      dispatch({ type: "set_error", error: t(failureCode("connectionError")) });
    } finally {
      turnstileRef.current?.reset();
    }
  }

  const isLogin = form.mode === "login";
  const PasswordIcon = form.showPassword ? EyeOff : Eye;

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
            label={t("account")}
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
              <FormError
                id="auth-username-error"
                message={form.usernameError}
                className="mt-2"
              />
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
                    <PasswordIcon size={17} strokeWidth={1.5} />
                  </button>
                )}
              </div>
              <FormError
                id="auth-password-error"
                message={form.passwordError}
                className="mt-2"
              />
            </div>

            <InvisibleTurnstile ref={turnstileRef} />

            <FormError message={form.error} />

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

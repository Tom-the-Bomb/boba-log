"use client";

import { CURRENCIES } from "@/lib/drinks";
import { failureCode } from "@/lib/network";
import type { ApiErrorResponse } from "@/lib/types";
import { Download } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Segmented, Select } from "../../components/ui/fields";
import { useUser } from "../../providers/user-provider";

function Section({
  title,
  children,
  tone = "default",
}: {
  title: string;
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section className="grid gap-x-12 gap-y-4 border-t border-rule py-8 md:grid-cols-[11rem_minmax(0,1fr)]">
      <h2
        className={`font-kai text-xl ${tone === "danger" ? "text-danger" : "text-text"}`}
      >
        {title}
      </h2>
      <div className="max-w-md">{children}</div>
    </section>
  );
}

async function postJson(url: string, method: string, body: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as ApiErrorResponse;
  return response.ok ? null : (data.code ?? "somethingWentWrong");
}

function PasswordSection({ username }: { username: string }) {
  const { t } = useTranslation("dashboard");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordField, setPasswordField] = useState<"current" | "new" | null>(
    null,
  );
  const [isChanging, setIsChanging] = useState(false);

  function passwordFail(code: string) {
    const field =
      code === "invalidPassword"
        ? "current"
        : code === "passwordMinLength"
          ? "new"
          : null;
    setPasswordError(t(code));
    setPasswordField(field);
    if (field) {
      document.getElementById(`settings-${field}-password`)?.focus();
    }
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < 6) {
      passwordFail("passwordMinLength");
      return;
    }
    setIsChanging(true);
    setPasswordError("");
    setPasswordField(null);
    try {
      const code = await postJson("/api/auth/password", "POST", {
        currentPassword,
        newPassword,
      });
      if (code) {
        passwordFail(code);
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      toast.success(t("passwordChanged"));
    } catch {
      passwordFail(failureCode("somethingWentWrong"));
    } finally {
      setIsChanging(false);
    }
  }

  return (
    <Section title={t("password")}>
      <form onSubmit={handlePasswordChange} noValidate className="space-y-4">
        <input
          type="text"
          autoComplete="username"
          value={username}
          readOnly
          hidden
        />
        <div>
          <label htmlFor="settings-current-password" className="label">
            {t("currentPassword")}
          </label>
          <input
            id="settings-current-password"
            aria-invalid={passwordField === "current" || undefined}
            aria-describedby={
              passwordField === "current"
                ? "settings-password-error"
                : undefined
            }
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="settings-new-password" className="label">
            {t("newPassword")}
          </label>
          <input
            id="settings-new-password"
            aria-invalid={passwordField === "new" || undefined}
            aria-describedby={
              passwordField === "new" ? "settings-password-error" : undefined
            }
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="field"
          />
        </div>
        {passwordError && (
          <p
            id="settings-password-error"
            className="text-sm text-danger"
            role="alert"
          >
            {passwordError}
          </p>
        )}
        <button
          type="submit"
          disabled={isChanging || !currentPassword || !newPassword}
          className="btn btn-quiet"
        >
          {isChanging ? t("saving") : t("changePassword")}
        </button>
      </form>
    </Section>
  );
}

function DeleteAccountSection() {
  const { t } = useTranslation("dashboard");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletePasswordWrong, setDeletePasswordWrong] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsDeleting(true);
    setDeleteError("");
    setDeletePasswordWrong(false);
    let leaving = false;
    try {
      const code = await postJson("/api/auth/account", "DELETE", {
        password: deletePassword,
      });
      if (code) {
        setDeleteError(t(code));
        setDeletePasswordWrong(code === "invalidPassword");
        if (code === "invalidPassword") {
          document.getElementById("settings-delete-password")?.focus();
        }
        return;
      }
      leaving = true;
      // A full load drops the account from memory; replace keeps Back off the dashboard.
      window.location.replace("/");
    } catch {
      setDeleteError(t(failureCode("couldNotDeleteAccount")));
    } finally {
      if (!leaving) {
        setIsDeleting(false);
      }
    }
  }

  return (
    <Section title={t("deleteAccount")} tone="danger">
      <form onSubmit={handleDelete} noValidate className="space-y-4">
        <p className="text-sm leading-relaxed text-text-2">
          {t("deleteAccountHint")}
        </p>
        <div>
          <label htmlFor="settings-delete-password" className="label">
            {t("confirmWithPassword")}
          </label>
          <input
            id="settings-delete-password"
            aria-invalid={deletePasswordWrong || undefined}
            aria-describedby={
              deletePasswordWrong ? "settings-delete-error" : undefined
            }
            type="password"
            autoComplete="current-password"
            value={deletePassword}
            onChange={(event) => setDeletePassword(event.target.value)}
            className="field"
          />
        </div>
        {deleteError && (
          <p
            id="settings-delete-error"
            className="text-sm text-danger"
            role="alert"
          >
            {deleteError}
          </p>
        )}
        <button
          type="submit"
          disabled={isDeleting || !deletePassword}
          className="btn btn-danger"
        >
          {isDeleting ? t("deleting") : t("deleteAccountButton")}
        </button>
      </form>
    </Section>
  );
}

export default function SettingsClient() {
  const { user, setCurrency } = useUser();
  const { t, i18n } = useTranslation("dashboard");
  const { resolvedTheme, setTheme } = useTheme();

  if (!user) {
    return null;
  }

  return (
    <main
      id="main-content"
      className="mx-auto max-w-4xl px-4 pt-8 pb-20 sm:px-8 sm:pt-10"
    >
      <h1 className="pb-8 font-kai text-4xl text-text">{t("settingsTitle")}</h1>

      <Section title={t("preferences")}>
        <div className="space-y-6">
          <div>
            <Select
              label={t("currency")}
              value={user.currency}
              options={CURRENCIES.map((currency) => ({
                value: currency,
                label: currency,
              }))}
              onChange={async (currency) => {
                const code = await setCurrency(currency);
                toast[code ? "error" : "success"](t(code ?? "saved"));
              }}
            />
            <p className="mt-2 text-xs text-text-2">{t("currencyHint")}</p>
          </div>
          <div>
            <p className="label">{t("language")}</p>
            <Segmented
              className="inline-grid"
              label={t("language")}
              value={i18n.language === "zh" ? "zh" : "en"}
              options={[
                { value: "en", label: "English" },
                { value: "zh", label: "中文" },
              ]}
              onChange={(value) => void i18n.changeLanguage(value)}
            />
          </div>
          <div>
            <p className="label">{t("theme")}</p>
            <Segmented
              className="inline-grid"
              label={t("theme")}
              value={resolvedTheme === "dark" ? "dark" : "light"}
              options={[
                { value: "light", label: t("themeLight") },
                { value: "dark", label: t("themeDark") },
              ]}
              onChange={setTheme}
            />
          </div>
        </div>
      </Section>

      <PasswordSection username={user.username} />

      <Section title={t("data")}>
        <p className="text-sm leading-relaxed text-text-2">{t("exportHint")}</p>
        <a href="/api/user/export" download className="btn btn-quiet mt-4">
          <Download size={15} strokeWidth={1.5} />
          {t("exportCsv")}
        </a>
      </Section>

      <DeleteAccountSection />
    </main>
  );
}

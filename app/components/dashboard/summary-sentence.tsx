"use client";

import { countsByShop, perWeek, spendSummary } from "@/lib/dashboard-metrics";
import { daysBetween } from "@/lib/date";
import { formatMoney } from "@/lib/drinks";
import type { Drink } from "@/lib/types";
import { Trans, useTranslation } from "react-i18next";
import { useDashboard } from "../../dashboard/dashboard-context";
import { useRangeLabel } from "./range-picker";

const EMPHASIS = { em: <em className="text-accent-ink not-italic" /> };

export default function SummarySentence({
  drinks,
  currency,
}: {
  drinks: readonly Drink[];
  currency: string;
}) {
  const { range } = useDashboard();
  const { t, i18n } = useTranslation("dashboard");
  const { start, end } = useRangeLabel();
  const count = drinks.length;

  if (count === 0) {
    return (
      <p className="font-kai text-[22px] leading-normal break-keep text-text sm:text-[28px]">
        {t("summaryEmpty", { start, end })}
      </p>
    );
  }

  const shops = t("shopCount", { count: countsByShop(drinks).size });
  const rate = perWeek(count, range);
  const spend = spendSummary(drinks);
  const showRate = count > 1 && daysBetween(range.start, range.end) >= 13;

  return (
    <div className="max-w-3xl space-y-2 font-kai text-[22px] leading-normal break-keep text-text sm:text-[28px]">
      <p>
        <Trans
          t={t}
          i18nKey={showRate ? "summary" : "summaryNoRate"}
          count={count}
          values={{
            start,
            end,
            shops,
            perWeek: rate.toLocaleString(i18n.language, {
              maximumFractionDigits: 1,
            }),
          }}
          components={EMPHASIS}
        />
      </p>
      {spend.priced > 0 && (
        <p className="text-lg text-text-2 sm:text-[22px]">
          <Trans
            t={t}
            i18nKey="spendLine"
            count={spend.priced}
            values={{
              spent: formatMoney(spend.cents, currency, i18n.language),
              average: formatMoney(
                Math.round(spend.cents / spend.priced),
                currency,
                i18n.language,
              ),
            }}
            components={EMPHASIS}
          />
        </p>
      )}
    </div>
  );
}

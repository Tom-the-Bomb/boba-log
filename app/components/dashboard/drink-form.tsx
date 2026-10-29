"use client";

import { translateShopName } from "@/lib/default-shops";
import {
  MAX_DRINK_NAME_LENGTH,
  MAX_DRINK_NOTE_LENGTH,
  parsePriceInput,
  priceInputValue,
} from "@/lib/drinks";
import type { BobaShop, Drink, DrinkInput } from "@/lib/types";
import { useId, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../../dashboard/dashboard-context";
import DatePicker from "../ui/date-picker";
import { FormError } from "../ui/fields";
import ShopAvatar from "./shop-avatar";

type Field = "name" | "price" | "note";

const FIELD_OF_CODE: Partial<Record<string, Field>> = {
  invalidPrice: "price",
  drinkNameTooLong: "name",
  drinkNoteTooLong: "note",
};

interface DrinkFormProps {
  shops: readonly BobaShop[];
  currency: string;
  drink?: Drink;
  initialShopId?: number;
  initialDay: string;
  onSubmit: (shopId: number, input: DrinkInput) => Promise<string | null>;
  onCancel?: () => void;
}

export default function DrinkForm({
  shops,
  currency,
  drink,
  initialShopId,
  initialDay,
  onSubmit,
  onCancel,
}: DrinkFormProps) {
  const { t, i18n } = useTranslation("dashboard");
  const { today } = useDashboard();
  const id = useId();
  const [shopId, setShopId] = useState(
    drink?.shopId ?? initialShopId ?? shops[0].id,
  );
  const [day, setDay] = useState(drink?.day ?? initialDay);
  const [name, setName] = useState(drink?.name ?? "");
  const [price, setPrice] = useState(() =>
    priceInputValue(drink?.priceCents ?? null),
  );
  const [note, setNote] = useState(drink?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const errorId = `${id}-error`;
  const errorField = error ? FIELD_OF_CODE[error] : undefined;

  function fail(code: string) {
    const field = FIELD_OF_CODE[code];
    setError(code);
    if (field) {
      document.getElementById(`${id}-${field}`)?.focus();
    }
  }

  const invalid = (field: Field) =>
    errorField === field
      ? { "aria-invalid": true, "aria-describedby": errorId }
      : {};

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const priceCents = parsePriceInput(price);
    if (priceCents === undefined) {
      fail("invalidPrice");
      return;
    }
    setIsSaving(true);
    setError(null);
    let code: string | null;
    try {
      code = await onSubmit(shopId, {
        day,
        name: name.trim() || null,
        priceCents,
        note: note.trim() || null,
      });
    } finally {
      setIsSaving(false);
    }
    if (code) {
      fail(code);
    } else if (!drink) {
      setName("");
      setPrice("");
      setNote("");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <fieldset className="min-w-0">
        <legend className="label">{t("colShop")}</legend>
        <div className="flex flex-wrap gap-2">
          {shops.map((shop) => {
            const shopName = translateShopName(shop.name, i18n.language);
            const checked = shop.id === shopId;
            return (
              <label
                key={shop.id}
                title={shopName}
                className={`tap-target relative inline-flex h-9 max-w-full cursor-pointer items-center gap-2 rounded-full border py-1 pr-3.5 pl-1 text-sm has-focus-visible:focus-ring ${
                  checked
                    ? "border-accent-ink/80 forced-selected bg-band text-text"
                    : "border-rule text-text-2 hover:border-rule-strong hover:text-text"
                }`}
              >
                <input
                  type="radio"
                  name={`${id}-shop`}
                  value={shop.id}
                  checked={checked}
                  onChange={() => setShopId(shop.id)}
                  className="sr-only"
                />
                <ShopAvatar src={shop.avatar} name={shopName} size={26} />
                <span className="min-w-0 truncate">{shopName}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)]">
        <div>
          <label htmlFor={`${id}-name`} className="label">
            {t("drinkName")}
          </label>
          <input
            id={`${id}-name`}
            {...invalid("name")}
            className="field"
            value={name}
            maxLength={MAX_DRINK_NAME_LENGTH}
            placeholder={t("drinkNamePlaceholder")}
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${id}-price`} className="label">
            {t("price")} <span className="text-text-3">· {currency}</span>
          </label>
          <input
            id={`${id}-price`}
            {...invalid("price")}
            className="field tabular-nums"
            value={price}
            inputMode="decimal"
            placeholder="6.50"
            autoComplete="off"
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>
      </div>

      <div
        className={`grid gap-3 ${drink ? "sm:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)]" : ""}`}
      >
        <div>
          <label htmlFor={`${id}-note`} className="label">
            {t("note")}
          </label>
          <input
            id={`${id}-note`}
            {...invalid("note")}
            className="field"
            value={note}
            maxLength={MAX_DRINK_NOTE_LENGTH}
            placeholder={t("notePlaceholder")}
            autoComplete="off"
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
        {drink && (
          <DatePicker
            label={t("colDate")}
            value={day}
            maxDay={today}
            onChange={setDay}
          />
        )}
      </div>

      <FormError id={errorId} message={error ? t(error) : ""} />

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-quiet">
            {t("cancel")}
          </button>
        )}
        <button type="submit" disabled={isSaving} className="btn btn-primary">
          {isSaving ? t("saving") : t(drink ? "save" : "addDrink")}
        </button>
      </div>
    </form>
  );
}

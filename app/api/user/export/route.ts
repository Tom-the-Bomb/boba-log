import { listDrinks } from "@/lib/api/drinks";
import { getUsernameFromRequest } from "@/lib/api/request-auth";
import {
  errorResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api/responses";
import { listShopRows } from "@/lib/api/shops";
import { getUserRow } from "@/lib/api/users";
import { dayFromUTCDate } from "@/lib/date";
import { NextRequest } from "next/server";

const HEADER = [
  "date",
  "shop",
  "drink",
  "price",
  "currency",
  "note",
  "logged_at",
];

// Quote every field, and defuse cells a spreadsheet would run as a formula.
function csvField(value: string | number | null): string {
  let text = value === null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return unauthorizedResponse();
    }

    const [user, shops, drinks] = await Promise.all([
      getUserRow(username),
      listShopRows(username),
      listDrinks(username),
    ]);
    if (!user) {
      return errorResponse("accountNotFound", "User not found", 404);
    }

    const shopNames = new Map(shops.map((shop) => [shop.id, shop.name]));
    const lines = [HEADER.join(",")];
    for (const drink of drinks) {
      lines.push(
        [
          drink.day,
          shopNames.get(drink.shopId) ?? "",
          drink.name,
          drink.priceCents === null
            ? null
            : (drink.priceCents / 100).toFixed(2),
          drink.priceCents === null ? null : user.currency,
          drink.note,
          new Date(drink.createdAt * 1000).toISOString(),
        ]
          .map(csvField)
          .join(","),
      );
    }

    const filename = `boba-log-${dayFromUTCDate(new Date())}.csv`;
    return new Response(`﻿${lines.join("\r\n")}\r\n`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return serverErrorResponse();
  }
}

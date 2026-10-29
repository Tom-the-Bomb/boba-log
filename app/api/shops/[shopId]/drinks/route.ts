import { createDrink } from "@/lib/api/drinks";
import { getUsernameFromRequest } from "@/lib/api/request-auth";
import {
  errorResponse,
  invalidRequestResponse,
  readJsonObject,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api/responses";
import { parseDrinkInput, parseId } from "@/lib/api/validation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: RouteContext<"/api/shops/[shopId]/drinks">,
) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return unauthorizedResponse();
    }

    const shopId = parseId((await params).shopId);
    if (!shopId) {
      return errorResponse("shopNotFound", "Shop not found.", 404);
    }

    const body = await readJsonObject(request);
    if (!body) {
      return invalidRequestResponse();
    }

    const parsed = parseDrinkInput(body);
    if (!parsed.ok) {
      return errorResponse(parsed.code, "Invalid drink.", 400);
    }

    const drink = await createDrink(username, shopId, parsed.value);
    if (!drink) {
      return errorResponse("shopNotFound", "Shop not found.", 404);
    }

    return NextResponse.json({ drink });
  } catch {
    return serverErrorResponse();
  }
}

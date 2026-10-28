import { deleteDrink, getDrink, updateDrink } from "@/lib/api/drinks";
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

function drinkNotFoundResponse() {
  return errorResponse("drinkNotFound", "Drink not found.", 404);
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext<"/api/drinks/[drinkId]">,
) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return unauthorizedResponse();
    }

    const drinkId = parseId((await params).drinkId);
    if (!drinkId) {
      return drinkNotFoundResponse();
    }

    const body = await readJsonObject(request);
    if (!body) {
      return invalidRequestResponse();
    }

    const parsed = parseDrinkInput(body, false);
    if (!parsed.ok) {
      return errorResponse(parsed.code, "Invalid drink.", 400);
    }

    const drink = await updateDrink(username, drinkId, parsed.value);
    if (!drink) {
      return parsed.value.shopId !== undefined &&
        (await getDrink(username, drinkId))
        ? errorResponse("shopNotFound", "Shop not found.", 404)
        : drinkNotFoundResponse();
    }

    return NextResponse.json({ drink });
  } catch {
    return serverErrorResponse();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext<"/api/drinks/[drinkId]">,
) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return unauthorizedResponse();
    }

    const drinkId = parseId((await params).drinkId);
    if (!drinkId || !(await deleteDrink(username, drinkId))) {
      return drinkNotFoundResponse();
    }

    return NextResponse.json({ success: true });
  } catch {
    return serverErrorResponse();
  }
}

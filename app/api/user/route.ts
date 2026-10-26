import { getUsernameFromRequest } from "@/lib/api/request-auth";
import {
  errorResponse,
  invalidRequestResponse,
  readJsonObject,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api/responses";
import { getPublicUser, updateCurrency } from "@/lib/api/users";
import { isCurrency } from "@/lib/drinks";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return unauthorizedResponse();
    }

    const user = await getPublicUser(username);
    if (!user) {
      return errorResponse("accountNotFound", "User not found", 404);
    }

    return NextResponse.json({ user });
  } catch {
    return serverErrorResponse();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const username = await getUsernameFromRequest(request);
    if (!username) {
      return unauthorizedResponse();
    }

    const body = await readJsonObject(request);
    if (!body) {
      return invalidRequestResponse();
    }

    if (!isCurrency(body.currency)) {
      return errorResponse("invalidCurrency", "Unsupported currency.", 400);
    }

    await updateCurrency(username, body.currency);
    return NextResponse.json({ currency: body.currency });
  } catch {
    return serverErrorResponse();
  }
}

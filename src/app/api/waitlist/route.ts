import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { brandWaitlist, sellerWaitlist } from "@/lib/db/schema";
import { TRAP_FIELD, toFieldErrors, waitlistSubmissionSchema } from "@/lib/waitlist/schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "We could not read that request." }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return NextResponse.json({ error: "We could not read that request." }, { status: 400 });
  }

  const { [TRAP_FIELD]: trap, ...fields } = payload as Record<string, unknown>;

  // Honeypot: accept and discard, so bots get no signal that they were caught.
  if (typeof trap === "string" && trap.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  const parsed = waitlistSubmissionSchema.safeParse(fields);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Some of those answers did not pass validation.",
        fieldErrors: toFieldErrors(parsed.error),
      },
      { status: 422 },
    );
  }

  const submission = parsed.data;

  try {
    // Columns are listed explicitly rather than spread, so a schema change can
    // never silently start (or stop) persisting a field.
    if (submission.kind === "seller") {
      await db.insert(sellerWaitlist).values({
        name: submission.name,
        email: submission.email,
        xHandle: submission.xHandle,
        location: submission.location,
        assetType: submission.assetType,
        priceExpectation: submission.priceExpectation,
        audienceReach: submission.audienceReach,
        eventContext: submission.eventContext,
      });
    } else {
      await db.insert(brandWaitlist).values({
        companyName: submission.companyName,
        contactEmail: submission.contactEmail,
        website: submission.website,
        industry: submission.industry,
        inventoryType: submission.inventoryType,
        budgetRange: submission.budgetRange,
        campaignTiming: submission.campaignTiming,
      });
    }
  } catch (error) {
    console.error("[waitlist] could not store submission", error);
    return NextResponse.json(
      { error: "We could not save that just now. Please try again in a moment." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

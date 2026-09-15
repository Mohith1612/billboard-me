import type { ZodType } from "zod";
import { describe, expect, it } from "vitest";
import {
  brandWaitlistSchema,
  sellerWaitlistSchema,
  toFieldErrors,
  waitlistSubmissionSchema,
} from "@/lib/waitlist/schema";

/**
 * The browser forms and the API route judge a submission with this schema, so
 * what it accepts, rewrites or rejects is the contract both sides depend on.
 */

const seller = { kind: "seller", name: "Ada", email: "ada@example.test" } as const;
const brand = { kind: "brand", companyName: "Acme", contactEmail: "buyer@example.test" } as const;

/** Parses a value that must be rejected, and returns the errors the forms render. */
function fieldErrorsFor(schema: ZodType, value: unknown): Record<string, string> {
  const result = schema.safeParse(value);
  if (result.success) {
    throw new Error(`Expected this value to be rejected: ${JSON.stringify(value)}`);
  }
  return toFieldErrors(result.error);
}

describe("required values", () => {
  it("trims surrounding whitespace before storing", () => {
    const parsed = sellerWaitlistSchema.parse({
      kind: "seller",
      name: "  Ada Lovelace  ",
      email: "  ada@example.test  ",
    });

    expect(parsed.name).toBe("Ada Lovelace");
    expect(parsed.email).toBe("ada@example.test");
  });

  it("rejects a value that is only whitespace", () => {
    expect(fieldErrorsFor(sellerWaitlistSchema, { ...seller, name: "   " })).toHaveProperty("name");
  });

  it("rejects a missing required value", () => {
    const value = { kind: "brand", contactEmail: brand.contactEmail };

    expect(fieldErrorsFor(brandWaitlistSchema, value)).toHaveProperty("companyName");
  });

  it("rejects a value past its maximum length", () => {
    expect(fieldErrorsFor(sellerWaitlistSchema, { ...seller, name: "a".repeat(121) }).name).toContain("120");
  });

  it("rejects an address that is not an email", () => {
    expect(fieldErrorsFor(sellerWaitlistSchema, { ...seller, email: "ada@@example" })).toHaveProperty("email");
  });
});

describe("optional values", () => {
  it("turns an empty or blank string into undefined rather than storing it", () => {
    const parsed = sellerWaitlistSchema.parse({ ...seller, xHandle: "", location: "   " });

    expect(parsed.xHandle).toBeUndefined();
    expect(parsed.location).toBeUndefined();
  });

  it("keeps and trims a value that was supplied", () => {
    const parsed = sellerWaitlistSchema.parse({ ...seller, xHandle: "  @ada  " });

    expect(parsed.xHandle).toBe("@ada");
  });

  it("accepts an omitted optional value", () => {
    expect(sellerWaitlistSchema.parse(seller).eventContext).toBeUndefined();
  });

  it("rejects an optional value past its maximum length", () => {
    const value = { ...seller, eventContext: "a".repeat(601) };

    expect(fieldErrorsFor(sellerWaitlistSchema, value)).toHaveProperty("eventContext");
  });
});

describe("choices", () => {
  it("accepts an offered option", () => {
    expect(sellerWaitlistSchema.parse({ ...seller, assetType: "MacBook" }).assetType).toBe("MacBook");
    expect(brandWaitlistSchema.parse({ ...brand, budgetRange: "Under ₹50k" }).budgetRange).toBe("Under ₹50k");
  });

  it("treats an unanswered choice as undefined", () => {
    expect(brandWaitlistSchema.parse({ ...brand, campaignTiming: "" }).campaignTiming).toBeUndefined();
  });

  it("rejects an option that was never offered", () => {
    const value = { ...brand, inventoryType: "Billboard" };

    expect(fieldErrorsFor(brandWaitlistSchema, value)).toHaveProperty("inventoryType");
  });
});

describe("submission kind", () => {
  it("routes each kind to its own shape", () => {
    expect(waitlistSubmissionSchema.parse(seller).kind).toBe("seller");
    expect(waitlistSubmissionSchema.parse(brand).kind).toBe("brand");
  });

  it("rejects an unknown kind", () => {
    expect(waitlistSubmissionSchema.safeParse({ ...seller, kind: "operator" }).success).toBe(false);
  });

  it("rejects a missing kind", () => {
    expect(waitlistSubmissionSchema.safeParse({ name: "Ada", email: "ada@example.test" }).success).toBe(false);
  });

  it("rejects a seller payload submitted as a brand", () => {
    expect(waitlistSubmissionSchema.safeParse({ ...seller, kind: "brand" }).success).toBe(false);
  });

  it("drops fields belonging to the other kind", () => {
    const parsed = waitlistSubmissionSchema.parse({ ...seller, companyName: "Acme" });

    expect(parsed).not.toHaveProperty("companyName");
  });
});

describe("toFieldErrors", () => {
  it("reports the first error per field, keyed by field name", () => {
    const fieldErrors = fieldErrorsFor(sellerWaitlistSchema, { kind: "seller", name: "", email: "nope" });

    expect(Object.keys(fieldErrors).sort()).toEqual(["email", "name"]);
    expect(typeof fieldErrors.name).toBe("string");
  });
});

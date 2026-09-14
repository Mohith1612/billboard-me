import { z } from "zod";

/**
 * Waitlist validation, shared by the browser forms and the API route so a
 * submission is judged by exactly the same rules on both sides.
 *
 * The option lists below are *form* options, not domain categories. The columns
 * behind them are plain `text` on purpose — AGENTS.md §2 requires the domain
 * model to stay generic even while the UI only exposes two asset types.
 */

export const ASSET_TYPE_OPTIONS = ["MacBook", "Jersey", "T-shirt", "Other"] as const;

export const INVENTORY_TYPE_OPTIONS = ["MacBook", "Jersey", "T-shirt", "Not sure yet"] as const;

export const BUDGET_RANGE_OPTIONS = [
  "Under ₹50k",
  "₹50k – ₹2L",
  "₹2L – ₹10L",
  "Over ₹10L",
  "Not decided yet",
] as const;

export const CAMPAIGN_TIMING_OPTIONS = [
  "As soon as possible",
  "This quarter",
  "Next quarter",
  "Just exploring",
] as const;

/** Name of the honeypot input. Anything that fills it in is not a person. */
export const TRAP_FIELD = "company_fax";

const requiredText = (max: number, message: string) =>
  z.string().trim().min(1, message).max(max, `Please keep this under ${max} characters.`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Please keep this under ${max} characters.`)
    .optional()
    .transform((value) => (value ? value : undefined));

const emailField = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .max(255, "Please keep this under 255 characters.")
    .pipe(z.email("That email address does not look right."));

const optionalChoice = <const T extends readonly [string, ...string[]]>(options: T) =>
  z
    .union([z.literal(""), z.enum(options)])
    .optional()
    .transform((value) => (value ? value : undefined));

export const sellerWaitlistSchema = z.object({
  kind: z.literal("seller"),
  name: requiredText(120, "Tell us what to call you."),
  email: emailField("We need an email address to reach you on."),
  xHandle: optionalText(60),
  location: optionalText(120),
  assetType: optionalChoice(ASSET_TYPE_OPTIONS),
  priceExpectation: optionalText(120),
  audienceReach: optionalText(160),
  eventContext: optionalText(600),
});

export const brandWaitlistSchema = z.object({
  kind: z.literal("brand"),
  companyName: requiredText(160, "Tell us which company you are with."),
  contactEmail: emailField("We need an email address to reach you on."),
  website: optionalText(200),
  industry: optionalText(120),
  inventoryType: optionalChoice(INVENTORY_TYPE_OPTIONS),
  budgetRange: optionalChoice(BUDGET_RANGE_OPTIONS),
  campaignTiming: optionalChoice(CAMPAIGN_TIMING_OPTIONS),
});

export const waitlistSubmissionSchema = z.discriminatedUnion("kind", [
  sellerWaitlistSchema,
  brandWaitlistSchema,
]);

export type SellerWaitlistSubmission = z.output<typeof sellerWaitlistSchema>;
export type BrandWaitlistSubmission = z.output<typeof brandWaitlistSchema>;
export type WaitlistSubmission = z.output<typeof waitlistSubmissionSchema>;

/** First error per field, in a shape the forms can render directly. */
export function toFieldErrors(error: z.ZodError<unknown>): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const [field] = issue.path;
    if (typeof field === "string" && !(field in fieldErrors)) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

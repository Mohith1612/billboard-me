"use client";

import { useState, type FormEvent } from "react";
import type { z } from "zod";
import { TRAP_FIELD, toFieldErrors } from "@/lib/waitlist/schema";

type Status = "idle" | "submitting" | "success" | "error";

function focusFirstInvalid(form: HTMLFormElement, invalidFields: string[]) {
  for (const element of Array.from(form.elements)) {
    const named = element as HTMLElement & { name?: string; focus?: () => void };
    if (named.name && invalidFields.includes(named.name) && typeof named.focus === "function") {
      named.focus();
      return;
    }
  }
}

/**
 * Validates a waitlist form with the same Zod schema the API route uses, then
 * posts it. Errors are surfaced per field plus a single summary message.
 */
export function useWaitlistForm<Output>(schema: z.ZodType<Output>, kind: "seller" | "brand") {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const raw: Record<string, unknown> = {};
    for (const [key, value] of new FormData(form).entries()) {
      if (typeof value === "string") raw[key] = value;
    }

    const trap = typeof raw[TRAP_FIELD] === "string" ? (raw[TRAP_FIELD] as string) : "";
    delete raw[TRAP_FIELD];

    const parsed = schema.safeParse({ ...raw, kind });
    if (!parsed.success) {
      const errors = toFieldErrors(parsed.error);
      setFieldErrors(errors);
      setFormError("Please check the highlighted answers and send it again.");
      setStatus("error");
      focusFirstInvalid(form, Object.keys(errors));
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setStatus("submitting");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, [TRAP_FIELD]: trap }),
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const message =
          typeof body === "object" && body !== null && typeof (body as { error?: unknown }).error === "string"
            ? (body as { error: string }).error
            : "Something went wrong on our side. Please try again.";

        if (
          typeof body === "object" &&
          body !== null &&
          typeof (body as { fieldErrors?: unknown }).fieldErrors === "object"
        ) {
          setFieldErrors((body as { fieldErrors: Record<string, string> }).fieldErrors ?? {});
        }
        setFormError(message);
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("success");
    } catch {
      setFormError("We could not reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  return { fieldErrors, formError, status, onSubmit };
}

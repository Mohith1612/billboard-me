"use client";

import { useEffect, useRef } from "react";
import {
  BUDGET_RANGE_OPTIONS,
  CAMPAIGN_TIMING_OPTIONS,
  INVENTORY_TYPE_OPTIONS,
  TRAP_FIELD,
  brandWaitlistSchema,
} from "@/lib/waitlist/schema";
import { FormNotice, HoneypotField, SelectField, SubmitRow, TextField } from "./fields";
import { useWaitlistForm } from "./use-waitlist-form";
import { WaitlistSuccess } from "./waitlist-success";

export function BrandWaitlistForm() {
  const { fieldErrors, formError, status, onSubmit } = useWaitlistForm(
    brandWaitlistSchema,
    "brand",
  );
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  if (status === "success") {
    return (
      <WaitlistSuccess
        ref={successRef}
        body="We will come back to you with what is actually available rather than a deck. If there is nothing that fits your budget or timing yet, we will say that instead of stalling."
      />
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-busy={status === "submitting"}
      className="relative grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2"
    >
      {formError ? <FormNotice message={formError} /> : null}

      <TextField
        name="companyName"
        label="Company name"
        required
        autoComplete="organization"
        error={fieldErrors.companyName}
      />
      <TextField
        name="contactEmail"
        label="Contact email"
        type="email"
        required
        autoComplete="email"
        error={fieldErrors.contactEmail}
      />
      <TextField
        name="website"
        label="Website"
        autoComplete="url"
        placeholder="acme.com"
        error={fieldErrors.website}
      />
      <TextField
        name="industry"
        label="Industry"
        placeholder="Developer tools"
        error={fieldErrors.industry}
      />
      <SelectField
        name="inventoryType"
        label="Preferred inventory"
        options={INVENTORY_TYPE_OPTIONS}
        error={fieldErrors.inventoryType}
      />
      <SelectField
        name="budgetRange"
        label="Rough budget range"
        options={BUDGET_RANGE_OPTIONS}
        error={fieldErrors.budgetRange}
      />
      <SelectField
        name="campaignTiming"
        label="Campaign timing"
        options={CAMPAIGN_TIMING_OPTIONS}
        hint="Knowing roughly when you want this live tells us which sellers to line up."
        error={fieldErrors.campaignTiming}
      />

      <HoneypotField name={TRAP_FIELD} />
      <SubmitRow pending={status === "submitting"} label="Join the brand list" />
    </form>
  );
}

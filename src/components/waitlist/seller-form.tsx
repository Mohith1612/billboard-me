"use client";

import { useEffect, useRef } from "react";
import {
  ASSET_TYPE_OPTIONS,
  TRAP_FIELD,
  sellerWaitlistSchema,
} from "@/lib/waitlist/schema";
import {
  FormNotice,
  HoneypotField,
  SelectField,
  SubmitRow,
  TextAreaField,
  TextField,
} from "./fields";
import { useWaitlistForm } from "./use-waitlist-form";
import { WaitlistSuccess } from "./waitlist-success";

export function SellerWaitlistForm() {
  const { fieldErrors, formError, status, onSubmit } = useWaitlistForm(
    sellerWaitlistSchema,
    "seller",
  );
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  if (status === "success") {
    return (
      <WaitlistSuccess
        ref={successRef}
        body="A person reads every one of these, usually within a few days. If what you carry matches something a sponsor is already asking for, we will email you to talk it through."
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
        name="name"
        label="Name"
        required
        autoComplete="name"
        error={fieldErrors.name}
      />
      <TextField
        name="email"
        label="Email"
        type="email"
        required
        autoComplete="email"
        error={fieldErrors.email}
      />
      <TextField
        name="xHandle"
        label="X / Twitter handle"
        autoComplete="off"
        placeholder="@yourhandle"
        error={fieldErrors.xHandle}
      />
      <TextField
        name="location"
        label="Location"
        autoComplete="address-level2"
        placeholder="Bengaluru, India"
        error={fieldErrors.location}
      />
      <SelectField
        name="assetType"
        label="Asset type"
        options={ASSET_TYPE_OPTIONS}
        error={fieldErrors.assetType}
      />
      <TextField
        name="priceExpectation"
        label="Rough price expectation"
        placeholder="₹8,000 a month"
        error={fieldErrors.priceExpectation}
      />
      <TextField
        name="audienceReach"
        label="Approximate audience / reach"
        className="sm:col-span-2"
        placeholder="12k on X, plus a co-working floor of about 200 people"
        hint="A rough, honest number is far more useful to us than an impressive one."
        error={fieldErrors.audienceReach}
      />
      <TextAreaField
        name="eventContext"
        label="Upcoming event or context"
        className="sm:col-span-2"
        rows={4}
        placeholder="Playing a city league through March, and I am at two conferences in February."
        hint="Anything coming up that puts your surface in front of more people."
        error={fieldErrors.eventContext}
      />

      <HoneypotField name={TRAP_FIELD} />
      <SubmitRow pending={status === "submitting"} label="Join the seller list" />
    </form>
  );
}

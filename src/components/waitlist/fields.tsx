import type { ReactNode } from "react";

type BaseProps = {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
};

function useIds(name: string, error?: string, hint?: string) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");
  return { id, errorId, hintId, describedBy: describedBy || undefined };
}

function FieldShell({
  id,
  label,
  required,
  hint,
  hintId,
  error,
  errorId,
  className,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  hintId: string;
  error?: string;
  errorId: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-baseline gap-2 spec text-ink-faint">
        <span className="text-ink-soft">{label}</span>
        {required ? (
          <span className="text-vermilion" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="normal-case tracking-normal opacity-70">optional</span>
        )}
      </label>
      {children}
      {hint ? (
        <p id={hintId} className="mt-2 text-[0.8125rem] leading-snug text-ink-faint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-2 text-[0.8125rem] leading-snug text-vermilion-deep">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  name,
  label,
  error,
  hint,
  required,
  className,
  type = "text",
  autoComplete,
  placeholder,
}: BaseProps & {
  type?: "text" | "email" | "url";
  autoComplete?: string;
  placeholder?: string;
}) {
  const { id, errorId, hintId, describedBy } = useIds(name, error, hint);
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      hintId={hintId}
      error={error}
      errorId={errorId}
      className={className}
    >
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="control mt-2"
      />
    </FieldShell>
  );
}

export function TextAreaField({
  name,
  label,
  error,
  hint,
  required,
  className,
  rows = 3,
  placeholder,
}: BaseProps & { rows?: number; placeholder?: string }) {
  const { id, errorId, hintId, describedBy } = useIds(name, error, hint);
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      hintId={hintId}
      error={error}
      errorId={errorId}
      className={className}
    >
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="control mt-2"
      />
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  error,
  hint,
  required,
  className,
  options,
  placeholder = "Choose one",
}: BaseProps & { options: readonly string[]; placeholder?: string }) {
  const { id, errorId, hintId, describedBy } = useIds(name, error, hint);
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      hintId={hintId}
      error={error}
      errorId={errorId}
      className={className}
    >
      <select
        id={id}
        name={name}
        required={required}
        defaultValue=""
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="control mt-2"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/** Off-screen decoy input. Real people never see it; bots fill it in. */
export function HoneypotField({ name }: { name: string }) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-px w-px overflow-hidden">
      <label htmlFor={`field-${name}`}>Fax number</label>
      <input id={`field-${name}`} name={name} type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export function FormNotice({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="col-span-full border-l-2 border-vermilion bg-vermilion/6 px-5 py-4"
    >
      <p className="spec text-vermilion-deep">Not sent</p>
      <p className="mt-2 text-[0.9375rem] leading-snug text-ink-soft">{message}</p>
    </div>
  );
}

export function SubmitRow({ pending, label }: { pending: boolean; label: string }) {
  return (
    <div className="col-span-full mt-2 flex flex-col gap-5 border-t border-rule pt-9 sm:flex-row sm:items-center sm:justify-between">
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Sending…" : label}
      </button>
      <p className="max-w-[36ch] spec text-ink-faint">
        We only use this to talk to you about Billboard.me.
      </p>
    </div>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display font-extrabold leading-none tracking-[-0.045em] ${className}`}
    >
      billboard<span className="text-vermilion">.me</span>
    </span>
  );
}

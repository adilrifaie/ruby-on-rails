import { cn } from "cn";
import { severityTone } from "@/lib/severity";

const TONES = [
  "border-severity-minimal/40 text-severity-minimal",
  "border-severity-mild/40 text-severity-mild",
  "border-severity-moderate/40 text-severity-moderate",
  "border-severity-severe/40 text-severity-severe",
];
const DOTS = ["bg-severity-minimal", "bg-severity-mild", "bg-severity-moderate", "bg-severity-severe"];

// The band label is always shown as text; color only reinforces it.
export default function SeverityBadge({ label, index = 0, count = 1, className }) {
  const tone = severityTone(index, count);
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border bg-card px-2.5 text-xs font-medium whitespace-nowrap",
        TONES[tone],
        className
      )}
    >
      <span className={cn("size-2 rounded-full", DOTS[tone])} aria-hidden="true" />
      {label}
    </span>
  );
}

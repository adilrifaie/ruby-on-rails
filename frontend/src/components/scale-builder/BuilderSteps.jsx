import { CheckIcon } from "lucide-react";
import { cn } from "cn";

// Progress through building a scale. Each step links to its section on the page.
export default function BuilderSteps({ steps }) {
  const currentIndex = steps.findIndex((step) => !step.done && !step.optional);

  return (
    <nav aria-label="Scale setup progress">
      <ol className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-4">
        {steps.map((step, index) => {
          const current = index === currentIndex;
          return (
            <li key={step.id}>
              <a
                href={`#${step.id}`}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "flex h-full items-center gap-3 rounded-xl border bg-card px-3 py-2.5 text-sm no-underline transition-colors hover:bg-muted",
                  current && "border-primary ring-1 ring-primary"
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums",
                    step.done ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}
                  aria-hidden="true"
                >
                  {step.done ? <CheckIcon className="size-4" /> : index + 1}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="font-medium text-foreground">{step.label}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {step.done ? "Done" : step.optional ? "Optional" : current ? "Up next" : "Not started"}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

import { Input } from "@/components/ui/input";

// Up to 11 options (e.g. 0–10) render as big radio buttons; wider ranges use a number field.
const MAX_BUTTONS = 11;

// Native radios styled as large pills: arrow keys, Tab and screen readers work without extra code.
export default function AnswerChoices({ question, value, onChange, describedBy }) {
  const { min_value: min, max_value: max } = question;
  const count = max - min + 1;

  if (count > MAX_BUTTONS) {
    return (
      <div className="flex flex-col gap-2">
        <Input
          id={`answer-${question.id}`}
          name={`question-${question.id}`}
          inputMode="numeric"
          autoComplete="off"
          className="h-14 max-w-40 text-center text-xl tabular-nums"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value.trim() === "" ? undefined : e.target.value.trim())}
          aria-describedby={describedBy}
          aria-label={`Your answer, from ${min} to ${max}`}
        />
        <p className="m-0 text-sm text-muted-foreground">
          Enter a whole number from {min} to {max}.
        </p>
      </div>
    );
  }

  const options = Array.from({ length: count }, (_, i) => min + i);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="grid gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${Math.min(count, 6)}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <label
            key={option}
            data-answer={option}
            className="relative flex h-14 cursor-pointer flex-row items-center justify-center rounded-full border border-input bg-card text-lg font-semibold text-foreground tabular-nums transition-colors select-none hover:border-primary/60 hover:bg-secondary has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option}
              checked={Number(value) === option && value !== undefined}
              onChange={() => onChange(String(option))}
              aria-describedby={describedBy}
              className="sr-only"
            />
            {option}
          </label>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min} = lowest</span>
        <span>{max} = highest</span>
      </div>
    </div>
  );
}

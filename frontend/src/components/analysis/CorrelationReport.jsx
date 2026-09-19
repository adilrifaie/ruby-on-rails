import { correlationStrength, round } from "@/lib/analysis";
import { pluralize } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

function QuestionRef({ letter, question, fallbackId }) {
  return (
    <li className="flex gap-3 rounded-xl border bg-card p-4">
      <span className="font-heading font-semibold text-muted-foreground" aria-hidden="true">{letter}</span>
      <span className="text-pretty break-words">{question ? question.text : `Question #${fallbackId} (removed)`}</span>
    </li>
  );
}

// Pearson's r between the answers to two questions.
export default function CorrelationReport({ results, questions }) {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const strength = correlationStrength(results.coefficient);

  return (
    <div className="flex flex-col gap-5">
      <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2" aria-label="Questions compared">
        <QuestionRef letter="A" question={byId.get(results.question_a_id)} fallbackId={results.question_a_id} />
        <QuestionRef letter="B" question={byId.get(results.question_b_id)} fallbackId={results.question_b_id} />
      </ol>

      {strength ? (
        <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-5">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <p className="m-0 font-heading text-4xl font-semibold tabular-nums">
              <span className="text-lg font-medium text-muted-foreground">r = </span>
              {round(results.coefficient, 3)}
            </p>
            <Badge variant="secondary">{strength.label}</Badge>
          </div>
          <p className="m-0 text-pretty">{strength.sentence}</p>
          <p className="m-0 text-sm text-muted-foreground">
            Based on {pluralize(results.n, "response")} that answered both questions. r runs from −1 to 1; values near 0 mean no
            linear relationship. A correlation doesn’t show that one answer causes the other.
          </p>
        </div>
      ) : (
        <p className="m-0 rounded-xl border border-dashed p-5 text-pretty text-muted-foreground">
          Not enough data: a correlation needs at least 2 responses that answered both questions, and this analysis had{" "}
          {results.n ?? 0}.
        </p>
      )}
    </div>
  );
}

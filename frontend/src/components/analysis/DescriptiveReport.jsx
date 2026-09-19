import { round } from "@/lib/analysis";
import { pluralize } from "@/lib/format";

function StatTile({ label, value, hint }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border bg-card p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="m-0 font-heading text-2xl font-semibold tabular-nums">{value}</dd>
      {hint && <dd className="m-0 text-xs text-muted-foreground">{hint}</dd>}
    </div>
  );
}

// Summary statistics of the survey's total scores.
export default function DescriptiveReport({ results, maxScore }) {
  if (!results.n) {
    return <p className="m-0 text-muted-foreground">There were no responses when this analysis ran, so there is nothing to summarize.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="m-0 text-pretty">
        Across {pluralize(results.n, "response")}, the mean total score is <strong className="tabular-nums">{round(results.mean)}</strong>
        {maxScore > 0 && <> out of {maxScore}</>}, and scores range from{" "}
        <span className="tabular-nums">{round(results.min)}</span> to <span className="tabular-nums">{round(results.max)}</span>.
      </p>
      <dl className="m-0 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Responses (n)" value={round(results.n)} />
        <StatTile label="Mean" value={round(results.mean)} />
        <StatTile label="Median" value={round(results.median)} hint="Middle score" />
        <StatTile label="Standard deviation" value={round(results.std_dev)} hint="Spread around the mean" />
        <StatTile label="Lowest score" value={round(results.min)} />
        <StatTile label="Highest score" value={round(results.max)} />
      </dl>
    </div>
  );
}

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { InfoIcon } from "lucide-react";
import { round } from "@/lib/analysis";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const chartConfig = {
  average: { label: "Average answer", color: "var(--chart-1)" },
  rest: { label: "Up to the maximum", color: "var(--muted)" },
};

function FactorTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="grid max-w-64 gap-1 rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
      <p className="m-0 font-medium text-pretty">{row.label}. {row.text}</p>
      <p className="m-0 text-muted-foreground tabular-nums">
        Average <span className="font-medium text-foreground">{round(row.average)}</span>
        {row.max_value != null && <> of {row.max_value}</>} · n = {row.n}
      </p>
    </div>
  );
}

// Per-question averages. The bar is the average answer; the pale track behind it runs to that question's maximum.
export default function FactorReport({ results, questions }) {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const rows = (results.questions || []).map((item, index) => {
    const question = byId.get(item.question_id);
    return {
      ...item,
      label: `Q${index + 1}`,
      min_value: question?.min_value,
      max_value: question?.max_value,
      rest: question && item.average != null ? question.max_value - item.average : question?.max_value,
    };
  });
  const domainMax = Math.max(1, ...rows.map((row) => row.max_value ?? row.max ?? 0));

  return (
    <div className="flex flex-col gap-5">
      {results.note && (
        <Alert>
          <InfoIcon />
          <AlertDescription>{results.note}. It shows how each question was answered on average; it doesn’t group questions into factors.</AlertDescription>
        </Alert>
      )}

      {rows.length > 0 && (
        <figure className="m-0 flex flex-col gap-2">
          <figcaption className="text-sm text-muted-foreground">Average answer per question, out of each question’s maximum</figcaption>
          <ChartContainer config={chartConfig} className="aspect-auto w-full" style={{ height: rows.length * 40 + 40 }}>
            <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }} barCategoryGap={8}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" domain={[0, domainMax]} allowDecimals={false} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="label" width={36} tickLine={false} axisLine={false} />
              <ChartTooltip cursor={false} content={<FactorTooltip />} />
              <Bar dataKey="average" stackId="range" fill="var(--color-average)" radius={[0, 4, 4, 0]} isAnimationActive={false} />
              <Bar dataKey="rest" stackId="range" fill="var(--color-rest)" radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
          </ChartContainer>
        </figure>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question</TableHead>
            <TableHead className="text-right">Average</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Lowest</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Highest</TableHead>
            <TableHead className="text-right">n</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.question_id}>
              <TableCell className="max-w-md whitespace-normal">
                <span className="mr-2 text-muted-foreground tabular-nums">{row.label}</span>
                {row.text}
                {row.max_value != null && (
                  <span className="ml-2 text-xs text-muted-foreground tabular-nums">({row.min_value}–{row.max_value})</span>
                )}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">{round(row.average)}</TableCell>
              <TableCell className="hidden text-right tabular-nums sm:table-cell">{round(row.min)}</TableCell>
              <TableCell className="hidden text-right tabular-nums sm:table-cell">{round(row.max)}</TableCell>
              <TableCell className="text-right tabular-nums">{row.n}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

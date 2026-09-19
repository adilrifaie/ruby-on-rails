import { Link } from "react-router-dom";
import { summarizeResults } from "@/lib/analysis";
import { formatDateTime } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Past analyses for one survey, newest first. The type links to the full report.
export default function AnalysesList({ analyses }) {
  if (analyses.length === 0) {
    return <p className="m-0 text-sm text-muted-foreground">No analyses yet. Pick a type above and run one.</p>;
  }

  const sorted = [...analyses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Analysis</TableHead>
          <TableHead className="hidden md:table-cell">Result</TableHead>
          <TableHead className="hidden sm:table-cell">Run</TableHead>
          <TableHead className="text-right">Cost</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((analysis) => (
          <TableRow key={analysis.id}>
            <TableCell className="font-medium">
              <Link to={`/analyses/${analysis.id}`} className="text-primary capitalize hover:underline">
                {analysis.analysis_type}
              </Link>
            </TableCell>
            <TableCell className="hidden text-muted-foreground tabular-nums md:table-cell">{summarizeResults(analysis)}</TableCell>
            <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">{formatDateTime(analysis.created_at)}</TableCell>
            <TableCell className="text-right tabular-nums">{analysis.credits_used} credits</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

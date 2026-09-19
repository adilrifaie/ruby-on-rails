import { Link } from "react-router-dom";
import { InboxIcon } from "lucide-react";
import SeverityBadge from "../SeverityBadge";
import { bandPosition } from "@/lib/severity";
import { formatDateTime } from "@/lib/format";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Newest first. The severity column only appears when the scale has scoring bands.
export default function ResponsesTable({ responses, bands, maxScore }) {
  if (responses.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon />
          </EmptyMedia>
          <EmptyTitle>No responses yet</EmptyTitle>
          <EmptyDescription>Share the public link above. Responses show up here as soon as they’re submitted.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const hasBands = bands.length > 0;
  const sorted = [...responses].sort((a, b) => new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0) || b.id - a.id);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Participant</TableHead>
          <TableHead className="hidden sm:table-cell">Submitted</TableHead>
          <TableHead className="text-right">Score</TableHead>
          {hasBands && <TableHead>Severity</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((response) => {
          const position = bandPosition(bands, response.severity_band);
          return (
            <TableRow key={response.id}>
              <TableCell className="max-w-56 font-medium">
                <Link to={`/responses/${response.id}`} className="block truncate text-primary hover:underline">
                  {response.participant_name}
                </Link>
              </TableCell>
              <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">{formatDateTime(response.submitted_at)}</TableCell>
              <TableCell className="text-right tabular-nums">
                <span className="font-medium">{response.score}</span>
                {maxScore > 0 && <span className="text-muted-foreground"> / {maxScore}</span>}
              </TableCell>
              {hasBands && (
                <TableCell>
                  {response.severity_band ? (
                    <SeverityBadge label={response.severity_band.label} index={position.index} count={position.count} />
                  ) : (
                    <span className="text-sm text-muted-foreground">Outside bands</span>
                  )}
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

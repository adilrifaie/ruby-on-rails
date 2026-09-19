import { useState } from "react";
import { LockIcon, PlusIcon, SparklesIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api/client";
import SeverityBadge from "../SeverityBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const INTEGER = /^-?\d+$/;
const SUGGESTED_LABELS = ["Minimal", "Mild", "Moderate", "Severe"];
let nextKey = 0;
const toRow = (band) => ({ key: nextKey++, label: band.label, min: String(band.min), max: String(band.max) });

// The lowest and highest total a participant can score: the sums of each question's min and max.
function totalRange(questions) {
  return questions.reduce((acc, q) => ({ min: acc.min + q.min_value, max: acc.max + q.max_value }), { min: 0, max: 0 });
}

// Splits [min, max] into up to four even bands.
function suggestBands({ min, max }) {
  const span = max - min + 1;
  const count = Math.min(SUGGESTED_LABELS.length, span);
  return Array.from({ length: count }, (_, i) => ({
    label: SUGGESTED_LABELS[count === 4 ? i : Math.round((i * 3) / Math.max(count - 1, 1))],
    min: min + Math.floor((i * span) / count),
    max: min + Math.floor(((i + 1) * span) / count) - 1,
  }));
}

// Returns [bands, problems]: parsed bands, plus one message per row that needs fixing.
function validate(rows) {
  const problems = [];
  const bands = rows.map((row, i) => {
    if (!row.label.trim()) problems.push(`Band ${i + 1} needs a label.`);
    if (!INTEGER.test(row.min.trim()) || !INTEGER.test(row.max.trim())) problems.push(`Band ${i + 1} needs whole-number scores.`);
    else if (Number(row.min) > Number(row.max)) problems.push(`Band ${i + 1} starts above where it ends.`);
    return { label: row.label.trim(), min: Number(row.min), max: Number(row.max) };
  });
  if (!problems.length) {
    const sorted = [...bands].sort((a, b) => a.min - b.min);
    sorted.slice(1).forEach((band, i) => {
      if (band.min <= sorted[i].max) problems.push(`“${sorted[i].label}” and “${band.label}” overlap.`);
    });
  }
  return [bands, problems];
}

// Score ranges inside the possible total that no band covers, e.g. ["9–10"].
function uncovered(bands, range) {
  const gaps = [];
  let cursor = range.min;
  [...bands].sort((a, b) => a.min - b.min).forEach((band) => {
    if (band.min > cursor) gaps.push([cursor, Math.min(band.min - 1, range.max)]);
    cursor = Math.max(cursor, band.max + 1);
  });
  if (cursor <= range.max) gaps.push([cursor, range.max]);
  return gaps.filter(([a, b]) => a <= b && a <= range.max).map(([a, b]) => (a === b ? `${a}` : `${a}–${b}`));
}

function BandList({ bands }) {
  const sorted = [...bands].sort((a, b) => a.min - b.min);
  return (
    <ul className="m-0 flex list-none flex-col divide-y rounded-xl border p-0">
      {sorted.map((band, index) => (
        <li key={`${band.label}-${band.min}`} className="flex items-center justify-between gap-4 px-4 py-3">
          <SeverityBadge label={band.label} index={index} count={sorted.length} />
          <span className="text-sm text-muted-foreground tabular-nums">
            Scores {band.min}–{band.max}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function ScoringBandsSection({ scale, questions, locked, onSaved }) {
  const savedBands = scale.scoring_bands || [];
  const [rows, setRows] = useState(() => savedBands.map(toRow));
  const [problems, setProblems] = useState([]);
  const [saving, setSaving] = useState(false);
  const range = totalRange(questions);

  if (locked) {
    return (
      <div className="flex flex-col gap-4">
        <Alert>
          <LockIcon />
          <AlertDescription>Scoring bands are locked because the scale is published.</AlertDescription>
        </Alert>
        {savedBands.length ? (
          <BandList bands={savedBands} />
        ) : (
          <p className="m-0 text-sm text-muted-foreground">No scoring bands. Responses get a total score without a severity label.</p>
        )}
      </div>
    );
  }

  const updateRow = (key, name, value) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, [name]: value } : row)));
    setProblems([]);
  };

  const addRow = () => {
    const [bands] = validate(rows);
    const lastMax = bands.length ? Math.max(...bands.map((b) => (Number.isFinite(b.max) ? b.max : range.min))) : range.min - 1;
    const min = lastMax + 1;
    setRows((current) => [...current, toRow({ label: "", min, max: Math.max(min, range.max) })]);
    setProblems([]);
  };

  const handleSave = async () => {
    const [bands, errs] = validate(rows);
    setProblems(errs);
    if (errs.length) return;
    setSaving(true);
    try {
      const updated = await api.updateScale(scale.id, { scoring_bands: bands });
      onSaved(updated);
      toast.success(bands.length ? "Scoring bands saved." : "Scoring bands removed.");
    } catch (err) {
      setProblems([err.message]);
    } finally {
      setSaving(false);
    }
  };

  const [parsed, currentProblems] = validate(rows);
  const gaps = questions.length && !currentProblems.length && rows.length ? uncovered(parsed, range) : [];

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-sm text-pretty text-muted-foreground">
        {questions.length ? (
          <>
            With {questions.length} {questions.length === 1 ? "question" : "questions"}, total scores range from{" "}
            <strong className="font-medium text-foreground tabular-nums">{range.min}</strong> to{" "}
            <strong className="font-medium text-foreground tabular-nums">{range.max}</strong>.
          </>
        ) : (
          "Add questions first to see the range of possible total scores."
        )}
      </p>

      {rows.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-3 p-0" aria-label="Scoring bands">
          {rows.map((row, i) => (
            <li key={row.key} className="grid grid-cols-[1fr_5rem_5rem_auto] items-end gap-2 sm:gap-3">
              <Field>
                <FieldLabel htmlFor={`band-${row.key}-label`} className={i > 0 ? "sr-only" : undefined}>Label</FieldLabel>
                <Input id={`band-${row.key}-label`} value={row.label} placeholder="Moderate" autoComplete="off" onChange={(e) => updateRow(row.key, "label", e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`band-${row.key}-min`} className={i > 0 ? "sr-only" : undefined}>From</FieldLabel>
                <Input id={`band-${row.key}-min`} value={row.min} inputMode="numeric" autoComplete="off" onChange={(e) => updateRow(row.key, "min", e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`band-${row.key}-max`} className={i > 0 ? "sr-only" : undefined}>To</FieldLabel>
                <Input id={`band-${row.key}-max`} value={row.max} inputMode="numeric" autoComplete="off" onChange={(e) => updateRow(row.key, "max", e.target.value)} />
              </Field>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove band ${row.label || i + 1}`}
                onClick={() => {
                  setRows((current) => current.filter((r) => r.key !== row.key));
                  setProblems([]);
                }}
              >
                <Trash2Icon />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {problems.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm text-destructive" role="alert">
          {problems.map((problem) => <li key={problem}>{problem}</li>)}
        </ul>
      )}
      {gaps.length > 0 && (
        <p className="m-0 text-sm text-muted-foreground">
          No band covers {gaps.length === 1 ? "score" : "scores"} {gaps.join(", ")}. Those responses won’t get a severity label.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={addRow}>
          <PlusIcon data-icon="inline-start" />
          Add band
        </Button>
        {rows.length === 0 && questions.length > 0 && (
          <Button variant="outline" onClick={() => setRows(suggestBands(range).map(toRow))}>
            <SparklesIcon data-icon="inline-start" />
            Suggest 4 bands
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Spinner data-icon="inline-start" />}
          Save scoring bands
        </Button>
      </div>
    </div>
  );
}

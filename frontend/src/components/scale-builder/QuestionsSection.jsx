import { useState } from "react";
import { LockIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const INTEGER = /^-?\d+$/;

// Validates {text, min, max} strings from the form. Returns [values, errors].
function parseQuestion({ text, min, max }) {
  const errors = {};
  if (!text.trim()) errors.text = "Write the question.";
  if (!INTEGER.test(min.trim())) errors.min = "Use a whole number.";
  if (!INTEGER.test(max.trim())) errors.max = "Use a whole number.";
  if (!errors.min && !errors.max && Number(max) <= Number(min)) errors.max = "Must be higher than the lowest answer.";
  return [{ text: text.trim(), min_value: Number(min), max_value: Number(max) }, errors];
}

// Text + answer range fields, shared by the add form and the edit dialog. `idPrefix` keeps ids unique.
function QuestionFields({ idPrefix, values, errors, onChange }) {
  const field = (name) => ({
    id: `${idPrefix}-${name}`,
    value: values[name],
    "aria-invalid": !!errors[name] || undefined,
    "aria-describedby": errors[name] ? `${idPrefix}-${name}-error` : undefined,
    onChange: (e) => onChange(name, e.target.value),
  });

  return (
    <>
      <Field data-invalid={!!errors.text || undefined}>
        <FieldLabel htmlFor={`${idPrefix}-text`}>Text</FieldLabel>
        <Textarea {...field("text")} rows={2} placeholder="Over the last 2 weeks, how often have you felt nervous or anxious?" />
        <FieldError id={`${idPrefix}-text-error`}>{errors.text}</FieldError>
      </Field>
      <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
        <Field data-invalid={!!errors.min || undefined}>
          <FieldLabel htmlFor={`${idPrefix}-min`}>Min value</FieldLabel>
          <Input {...field("min")} inputMode="numeric" autoComplete="off" />
          <FieldError id={`${idPrefix}-min-error`}>{errors.min}</FieldError>
        </Field>
        <Field data-invalid={!!errors.max || undefined}>
          <FieldLabel htmlFor={`${idPrefix}-max`}>Max value</FieldLabel>
          <Input {...field("max")} inputMode="numeric" autoComplete="off" />
          <FieldError id={`${idPrefix}-max-error`}>{errors.max}</FieldError>
        </Field>
      </div>
    </>
  );
}

function AddQuestionForm({ scaleId, nextPosition, onAdded }) {
  const [values, setValues] = useState({ text: "", min: "0", max: "4" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const [question, errs] = parseQuestion(values);
    setErrors(errs);
    setError(null);
    const firstInvalid = Object.keys(errs)[0];
    if (firstInvalid) {
      document.getElementById(`new-question-${firstInvalid}`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const created = await api.createQuestion(scaleId, { ...question, position: nextPosition });
      onAdded(created);
      // Keep the answer range: most scales use the same range for every question.
      setValues((v) => ({ ...v, text: "" }));
      document.getElementById("new-question-text")?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-none rounded-xl border border-dashed p-4">
      <FieldGroup>
        <QuestionFields
          idPrefix="new-question"
          values={values}
          errors={errors}
          onChange={(name, value) => {
            setValues((v) => ({ ...v, [name]: value }));
            setErrors((errs) => ({ ...errs, [name]: undefined }));
          }}
        />
        {error && <p className="m-0 text-sm text-destructive" role="alert">{error}</p>}
        <div>
          <Button type="submit" variant="secondary" disabled={submitting}>
            {submitting ? <Spinner data-icon="inline-start" /> : <PlusIcon data-icon="inline-start" />}
            Add question
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

function EditQuestionDialog({ scaleId, question, number, onSaved, onClose }) {
  const [values, setValues] = useState({
    text: question.text,
    min: String(question.min_value),
    max: String(question.max_value),
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const [changes, errs] = parseQuestion(values);
    setErrors(errs);
    setError(null);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      onSaved(await api.updateQuestion(scaleId, question.id, changes));
      toast.success("Question saved.");
      onClose();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} noValidate className="max-w-none">
          <DialogHeader>
            <DialogTitle>Edit question {number}</DialogTitle>
            <DialogDescription>Change the wording or the range of answers participants can pick.</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <QuestionFields
              idPrefix="edit-question"
              values={values}
              errors={errors}
              onChange={(name, value) => {
                setValues((v) => ({ ...v, [name]: value }));
                setErrors((errs) => ({ ...errs, [name]: undefined }));
              }}
            />
            {error && <p className="m-0 text-sm text-destructive" role="alert">{error}</p>}
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Spinner data-icon="inline-start" />}
              Save question
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteQuestionButton({ scaleId, question, number, onDeleted }) {
  const handleDelete = async () => {
    try {
      await api.destroyQuestion(scaleId, question.id);
      onDeleted(question.id);
      toast("Question deleted.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Delete question ${number}`}>
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete question {number}?</AlertDialogTitle>
          <AlertDialogDescription>“{question.text}” will be removed from this scale. This can’t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep question</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete}>Delete question</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function QuestionsSection({ scale, questions, locked, onQuestionsChange }) {
  const [editing, setEditing] = useState(null);
  const sorted = [...questions].sort((a, b) => a.position - b.position);
  const nextPosition = sorted.reduce((max, q) => Math.max(max, q.position), 0) + 1;

  return (
    <div className="flex flex-col gap-4">
      {locked && (
        <Alert>
          <LockIcon />
          <AlertDescription>This scale is published, so its questions are locked. Every response is scored against the same questions.</AlertDescription>
        </Alert>
      )}

      {sorted.length === 0 ? (
        <p className="m-0 text-sm text-muted-foreground">No questions yet. Add the first one below.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Question</TableHead>
              <TableHead className="hidden w-24 sm:table-cell">Answers</TableHead>
              {!locked && <TableHead className="w-px text-right"><span className="sr-only">Actions</span></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((question, index) => (
              <TableRow key={question.id}>
                <TableCell className="align-top text-muted-foreground tabular-nums">{index + 1}</TableCell>
                <TableCell className="align-top whitespace-normal text-pretty">
                  {question.text}
                  <span className="mt-1 block text-xs text-muted-foreground tabular-nums sm:hidden">
                    Answers {question.min_value}–{question.max_value}
                  </span>
                </TableCell>
                <TableCell className="hidden align-top tabular-nums sm:table-cell">
                  {question.min_value}–{question.max_value}
                </TableCell>
                {!locked && (
                  <TableCell className="align-top text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label={`Edit question ${index + 1}`} onClick={() => setEditing({ question, number: index + 1 })}>
                        <PencilIcon />
                      </Button>
                      <DeleteQuestionButton
                        scaleId={scale.id}
                        question={question}
                        number={index + 1}
                        onDeleted={(id) => onQuestionsChange(questions.filter((q) => q.id !== id))}
                      />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!locked && (
        <AddQuestionForm scaleId={scale.id} nextPosition={nextPosition} onAdded={(created) => onQuestionsChange([...questions, created])} />
      )}

      {editing && (
        <EditQuestionDialog
          scaleId={scale.id}
          question={editing.question}
          number={editing.number}
          onSaved={(updated) => onQuestionsChange(questions.map((q) => (q.id === updated.id ? updated : q)))}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

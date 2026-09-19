import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

// Title, description and version. Used to create a scale and to edit one (these stay editable after publishing).
export default function ScaleDetailsForm({ initial = {}, submitLabel, onSubmit, autoFocus = false }) {
  const [titleError, setTitleError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values = {
      title: String(form.get("title")).trim(),
      description: String(form.get("description")).trim(),
      version: String(form.get("version")).trim() || "1.0",
    };
    if (!values.title) {
      setTitleError("Give the scale a title.");
      document.getElementById("scale-title")?.focus();
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-none">
      <FieldGroup>
        <Field data-invalid={!!titleError || undefined}>
          <FieldLabel htmlFor="scale-title">Title</FieldLabel>
          <Input
            id="scale-title"
            name="title"
            defaultValue={initial.title}
            placeholder="PHQ-9 depression screening"
            autoComplete="off"
            autoFocus={autoFocus}
            aria-invalid={!!titleError || undefined}
            aria-describedby={titleError ? "scale-title-error" : undefined}
            onChange={() => setTitleError(null)}
          />
          <FieldError id="scale-title-error">{titleError}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="scale-description">Description</FieldLabel>
          <Textarea
            id="scale-description"
            name="description"
            defaultValue={initial.description}
            placeholder="What the scale measures and who it’s for…"
            rows={3}
            aria-describedby="scale-description-hint"
          />
          <FieldDescription id="scale-description-hint">Participants see this above the first question.</FieldDescription>
        </Field>
        <Field className="max-w-40">
          <FieldLabel htmlFor="scale-version">Version</FieldLabel>
          <Input id="scale-version" name="version" defaultValue={initial.version || "1.0"} autoComplete="off" spellCheck={false} />
        </Field>
        <div>
          <Button type="submit" disabled={submitting}>
            {submitting && <Spinner data-icon="inline-start" />}
            {submitLabel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

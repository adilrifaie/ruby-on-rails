import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleCheckIcon, CircleDashedIcon, CircleIcon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api/client";
import { pluralize } from "@/lib/format";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

function ChecklistItem({ done, optional, children }) {
  const Icon = done ? CircleCheckIcon : optional ? CircleDashedIcon : CircleIcon;
  return (
    <li className="flex items-start gap-2.5">
      <Icon className={done ? "mt-0.5 size-4 shrink-0 text-primary" : "mt-0.5 size-4 shrink-0 text-muted-foreground"} aria-hidden="true" />
      <span>
        <span className="sr-only">{done ? "Done: " : optional ? "Optional: " : "To do: "}</span>
        {children}
      </span>
    </li>
  );
}

function PublishPanel({ scale, questions, onPublished }) {
  const [publishing, setPublishing] = useState(false);
  const bandCount = (scale.scoring_bands || []).length;
  const canPublish = questions.length > 0;

  const handlePublish = async () => {
    setPublishing(true);
    try {
      onPublished(await api.publishScale(scale.id));
      toast.success("Scale published. You can now create surveys from it.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
        <ChecklistItem done={questions.length > 0}>
          {questions.length > 0 ? `${pluralize(questions.length, "question")} added` : "Add at least one question"}
        </ChecklistItem>
        <ChecklistItem done={bandCount > 0} optional>
          {bandCount > 0
            ? `${pluralize(bandCount, "scoring band")} set`
            : "Scoring bands (optional): without them, responses get a score but no severity label"}
        </ChecklistItem>
      </ul>
      <p className="m-0 text-sm text-pretty text-muted-foreground">
        Publishing locks the questions and scoring bands so every response is scored the same way. You can still edit the
        title, description and version.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={!canPublish || publishing} aria-describedby={canPublish ? undefined : "publish-blocked"}>
              {publishing ? <Spinner data-icon="inline-start" /> : <SendIcon data-icon="inline-start" />}
              Publish scale
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Publish “{scale.title}”?</AlertDialogTitle>
              <AlertDialogDescription>
                Its {pluralize(questions.length, "question")} and {bandCount ? pluralize(bandCount, "scoring band") : "scoring bands"} will be
                locked for good. You’ll then be able to create surveys from it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep editing</AlertDialogCancel>
              <AlertDialogAction onClick={handlePublish}>Publish</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {!canPublish && (
          <span id="publish-blocked" className="text-sm text-muted-foreground">
            Add a question to publish.
          </span>
        )}
      </div>
    </div>
  );
}

function CreateSurveyForm({ scale, surveys }) {
  const navigate = useNavigate();
  const [titleError, setTitleError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = String(new FormData(e.currentTarget).get("title")).trim();
    if (!title) {
      setTitleError("Name the survey, for example by cohort or date.");
      document.getElementById("survey-title")?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const created = await api.createSurvey({ scale_id: scale.id, title, status: "active" });
      toast.success("Survey created. Share its link with participants.");
      navigate(`/surveys/${created.survey.id}`);
    } catch (err) {
      setTitleError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} noValidate className="max-w-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <Field data-invalid={!!titleError || undefined} className="flex-1">
            <FieldLabel htmlFor="survey-title">New survey title</FieldLabel>
            <Input
              id="survey-title"
              name="title"
              placeholder="Spring 2026 cohort"
              autoComplete="off"
              aria-invalid={!!titleError || undefined}
              aria-describedby={titleError ? "survey-title-error" : undefined}
              onChange={() => setTitleError(null)}
            />
            <FieldError id="survey-title-error">{titleError}</FieldError>
          </Field>
          <Button type="submit" disabled={submitting} className="sm:mt-7">
            {submitting && <Spinner data-icon="inline-start" />}
            Create survey
          </Button>
        </div>
      </form>

      {surveys.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="m-0 text-sm font-medium text-muted-foreground">Surveys from this scale</h3>
          <ul className="m-0 flex list-none flex-col divide-y rounded-xl border p-0">
            {surveys.map((survey) => (
              <li key={survey.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <Link to={`/surveys/${survey.id}`} className="truncate font-medium text-primary hover:underline">
                  {survey.title}
                </Link>
                <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                  {pluralize(survey.response_count || 0, "response")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function PublishSection({ scale, questions, surveys, onPublished }) {
  return scale.status === "published" ? (
    <CreateSurveyForm scale={scale} surveys={surveys} />
  ) : (
    <PublishPanel scale={scale} questions={questions} onPublished={onPublished} />
  );
}

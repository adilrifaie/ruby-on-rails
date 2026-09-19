import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleAlertIcon, CoinsIcon, PlayIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { ANALYSIS_TYPES, analysisType } from "@/lib/analysis";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";

function QuestionPicker({ id, label, value, onChange, questions, error }) {
  return (
    <Field data-invalid={!!error || undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <NativeSelect
        id={id}
        className="w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <NativeSelectOption value="">Choose a question…</NativeSelectOption>
        {questions.map((q, i) => (
          <NativeSelectOption key={q.id} value={q.id}>
            {i + 1}. {q.text}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </Field>
  );
}

export default function AnalysisRunner({ surveyId, questions, responseCount, onCreated }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState("descriptive");
  const [questionA, setQuestionA] = useState("");
  const [questionB, setQuestionB] = useState("");
  const [pickErrors, setPickErrors] = useState({});
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);

  const selected = analysisType(type);
  const shortBy = selected.cost - user.credits;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const params = { survey_id: surveyId, analysis_type: type };
    if (type === "correlation") {
      const errs = {};
      if (!questionA) errs.a = "Choose the first question.";
      if (!questionB) errs.b = "Choose the second question.";
      else if (questionA === questionB) errs.b = "Choose a different question from the first one.";
      setPickErrors(errs);
      if (Object.keys(errs).length) {
        document.getElementById(errs.a ? "question-a" : "question-b")?.focus();
        return;
      }
      params.question_a_id = questionA;
      params.question_b_id = questionB;
    }

    setRunning(true);
    try {
      const analysis = await api.createAnalysis(params);
      onCreated(analysis);
      refreshUser();
      toast.success(`${selected.name} analysis is ready.`, {
        action: { label: "View report", onClick: () => navigate(`/analyses/${analysis.id}`) },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-none">
      <div className="flex flex-col gap-6">
        <FieldSet>
          <FieldLegend variant="label">Type</FieldLegend>
          <RadioGroup value={type} onValueChange={(value) => { setType(value); setError(null); }} className="grid gap-3 md:grid-cols-3">
            {ANALYSIS_TYPES.map((option) => (
              <FieldLabel key={option.value} htmlFor={`analysis-${option.value}`}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{option.name}</FieldTitle>
                    <FieldDescription className="text-pretty">{option.description}</FieldDescription>
                    <Badge variant="outline" className="mt-1 tabular-nums">
                      {option.cost} credits
                    </Badge>
                  </FieldContent>
                  <RadioGroupItem value={option.value} id={`analysis-${option.value}`} />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        </FieldSet>

        {type === "correlation" && (
          <div className="grid gap-4 md:grid-cols-2">
            <QuestionPicker id="question-a" label="Question A" value={questionA} questions={questions} error={pickErrors.a}
              onChange={(v) => { setQuestionA(v); setPickErrors((p) => ({ ...p, a: undefined })); }} />
            <QuestionPicker id="question-b" label="Question B" value={questionB} questions={questions} error={pickErrors.b}
              onChange={(v) => { setQuestionB(v); setPickErrors((p) => ({ ...p, b: undefined })); }} />
          </div>
        )}

        {responseCount === 0 && (
          <p className="m-0 text-sm text-muted-foreground">This survey has no responses yet, so the results would be empty.</p>
        )}

        {error && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Button type="submit" disabled={running}>
            {running ? <Spinner data-icon="inline-start" /> : <PlayIcon data-icon="inline-start" />}
            Run analysis
          </Button>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CoinsIcon className="size-4" aria-hidden="true" />
            <span>
              Costs <span className="font-medium text-foreground tabular-nums">{selected.cost}</span> of your{" "}
              <span className="tabular-nums">{user.credits}</span> credits
              {shortBy > 0 && <span className="text-destructive"> · you need {shortBy} more</span>}
            </span>
          </span>
        </div>
      </div>
    </form>
  );
}

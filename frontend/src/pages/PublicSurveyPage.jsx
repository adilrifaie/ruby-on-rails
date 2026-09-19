import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, ArrowRightIcon, CircleAlertIcon, ClockIcon, ListChecksIcon, LockIcon } from "lucide-react";
import { api } from "../api/client";
import AnswerChoices from "../components/participant/AnswerChoices";
import { usePageTitle } from "@/hooks/use-page-title";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

// Progress survives a refresh within the same tab; it's cleared once the response is submitted.
const storageKey = (id) => `survey-progress-${id}`;
function loadProgress(id) {
  try {
    return JSON.parse(sessionStorage.getItem(storageKey(id))) || {};
  } catch {
    return {};
  }
}
function saveProgress(id, progress) {
  try {
    sessionStorage.setItem(storageKey(id), JSON.stringify(progress));
  } catch {
    // Storage can be unavailable (private mode); the survey still works without it.
  }
}
function clearProgress(id) {
  try {
    sessionStorage.removeItem(storageKey(id));
  } catch {
    // Nothing to clear.
  }
}

const isValidAnswer = (question, value) =>
  value !== undefined && /^-?\d+$/.test(value) && Number(value) >= question.min_value && Number(value) <= question.max_value;

function Heading({ headingRef, children }) {
  return (
    <h1 ref={headingRef} tabIndex={-1} className="m-0 text-2xl leading-snug text-balance outline-none sm:text-3xl">
      {children}
    </h1>
  );
}

function Intro({ survey, questionCount, name, setName, onStart, headingRef }) {
  const [error, setError] = useState(null);
  const minutes = Math.max(1, Math.round((questionCount * 15) / 60));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Enter your name so the researcher can tell responses apart.");
      document.getElementById("participant-name")?.focus();
      return;
    }
    onStart();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-none flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Heading headingRef={headingRef}>{survey.scale.title}</Heading>
        {survey.scale.description && <p className="m-0 text-lg text-pretty text-muted-foreground">{survey.scale.description}</p>}
        <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-sm text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <ListChecksIcon className="size-4" aria-hidden="true" />
            {questionCount} {questionCount === 1 ? "question" : "questions"}
          </li>
          <li className="flex items-center gap-1.5">
            <ClockIcon className="size-4" aria-hidden="true" />
            About {minutes} {minutes === 1 ? "minute" : "minutes"}
          </li>
        </ul>
      </div>

      <Field data-invalid={!!error || undefined}>
        <FieldLabel htmlFor="participant-name">Your name</FieldLabel>
        <Input
          id="participant-name"
          name="participant_name"
          autoComplete="name"
          className="h-12 text-base"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? "participant-name-error" : "participant-name-hint"}
        />
        {error ? (
          <FieldError id="participant-name-error">{error}</FieldError>
        ) : (
          <FieldDescription id="participant-name-hint">Initials are fine.</FieldDescription>
        )}
      </Field>

      <p className="m-0 flex items-start gap-2 text-sm text-pretty text-muted-foreground">
        <LockIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Your answers go only to the researcher who shared this link. There are no right or wrong answers.
      </p>

      <div>
        <Button type="submit" size="lg">
          Start
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </form>
  );
}

function QuestionStep({ question, number, total, value, onAnswer, onNext, onBack, isLast, returnToReview, headingRef }) {
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidAnswer(question, value)) {
      setError(
        value === undefined
          ? "Choose an answer to continue."
          : `Enter a whole number from ${question.min_value} to ${question.max_value}.`
      );
      document.querySelector(`[name="question-${question.id}"]`)?.focus();
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-none flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question <span className="tabular-nums">{number}</span> of <span className="tabular-nums">{total}</span>
          </span>
          <span className="tabular-nums">{Math.round(((number - 1) / total) * 100)}% done</span>
        </div>
        <Progress value={((number - 1) / total) * 100} aria-label="Survey progress" className="h-1.5" />
      </div>

      <fieldset className="m-0 flex min-w-0 flex-col gap-6 border-0 p-0">
        <legend className="mb-6 p-0">
          <Heading headingRef={headingRef}>{question.text}</Heading>
        </legend>
        <AnswerChoices
          question={question}
          value={value}
          onChange={(v) => {
            onAnswer(v);
            setError(null);
          }}
          describedBy={error ? "answer-error" : undefined}
        />
        {error && (
          <p id="answer-error" role="alert" className="m-0 text-sm font-medium text-destructive">
            {error}
          </p>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back
        </Button>
        <Button type="submit" size="lg">
          {isLast || returnToReview ? "Review answers" : "Next"}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
    </form>
  );
}

function Review({ name, questions, answers, onChange, onBack, onSubmit, submitting, error, headingRef }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex max-w-none flex-col gap-8"
    >
      <div className="flex flex-col gap-2">
        <Heading headingRef={headingRef}>Check your answers</Heading>
        <p className="m-0 text-muted-foreground">You can change any answer before you submit.</p>
      </div>

      <dl className="m-0 flex flex-col divide-y rounded-xl border bg-card">
        <div className="flex items-start justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-sm text-muted-foreground">Your name</dt>
            <dd className="m-0 font-medium break-words">{name}</dd>
          </div>
          <Button type="button" variant="link" className="h-auto px-0" onClick={() => onChange(0)} aria-label="Change your name">
            Change
          </Button>
        </div>
        {questions.map((question, index) => (
          <div key={question.id} className="flex items-start justify-between gap-4 px-4 py-3">
            <div className="flex min-w-0 flex-col gap-0.5">
              <dt className="text-sm text-pretty text-muted-foreground">
                {index + 1}. {question.text}
              </dt>
              <dd className="m-0 font-heading text-lg font-semibold tabular-nums">{answers[question.id]}</dd>
            </div>
            <Button
              type="button"
              variant="link"
              className="h-auto shrink-0 px-0"
              onClick={() => onChange(index + 1)}
              aria-label={`Change your answer to question ${index + 1}`}
          >
              Change
            </Button>
          </div>
        ))}
      </dl>

      {error && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Your answers weren’t sent</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeftIcon data-icon="inline-start" />
          Back
        </Button>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting && <Spinner data-icon="inline-start" />}
          Submit answers
        </Button>
      </div>
    </form>
  );
}

export default function PublicSurveyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const headingRef = useRef(null);
  const firstRender = useRef(true);

  const [survey, setSurvey] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [step, setStep] = useState(() => loadProgress(id).step ?? 0);
  const [name, setName] = useState(() => loadProgress(id).name ?? "");
  const [answers, setAnswers] = useState(() => loadProgress(id).answers ?? {});
  const [returnToReview, setReturnToReview] = useState(false);
  const [direction, setDirection] = useState("forward");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  usePageTitle(survey?.scale.title);

  useEffect(() => {
    let ignore = false;
    api
      .getSurvey(id, { auth: false })
      .then((data) => !ignore && setSurvey(data))
      .catch((err) => {
        if (ignore) return;
        setLoadError(err.status === 404 ? "This survey link isn’t working. Check the link with the person who shared it." : err.message);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    saveProgress(id, { step, name, answers });
  }, [id, step, name, answers]);

  // Move focus to the new screen's heading so screen readers announce it.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [step]);

  // Warn before leaving with answers that haven't been sent.
  const inProgress = step > 0 && Object.keys(answers).length > 0 && !submitting;
  useEffect(() => {
    if (!inProgress) return;
    const warn = (e) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [inProgress]);

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl">
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>This survey couldn’t be opened</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!survey) {
    return (
      <div aria-hidden="true" className="mx-auto flex max-w-xl flex-col gap-4">
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="mt-6 h-12 w-full rounded-lg" />
      </div>
    );
  }

  const questions = [...(survey.scale.questions || [])].sort((a, b) => a.position - b.position);
  const total = questions.length;

  if (total === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <Alert>
          <CircleAlertIcon />
          <AlertTitle>This survey isn’t ready yet</AlertTitle>
          <AlertDescription>It has no questions. Check back later or contact the person who shared it.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // A saved step can be out of range if the survey changed since; fall back to the intro.
  const current = step > total + 1 ? 0 : step;
  const goTo = (next) => {
    setDirection(next < current ? "back" : "forward");
    setStep(next);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = await api.createResponse({
        survey_id: survey.id,
        participant_name: name.trim(),
        submitted_at: new Date().toISOString(),
        answers_attributes: questions.map((q) => ({ question_id: q.id, value: Number(answers[q.id]) })),
      });
      clearProgress(id);
      const maxScore = questions.reduce((sum, q) => sum + q.max_value, 0);
      navigate(`/responses/${result.response.id}/thanks`, { replace: true, state: { score: result.score, maxScore, title: survey.scale.title } });
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <Card className="[--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
        <CardContent>
          {/* Keyed by screen so each one slides in from the direction the participant is moving. */}
          <div
            key={current}
            className={`animate-in duration-200 ease-out fade-in ${direction === "back" ? "slide-in-from-left-4" : "slide-in-from-right-4"}`}
          >
            {current === 0 && (
              <Intro
                survey={survey}
                questionCount={total}
                name={name}
                setName={setName}
                headingRef={headingRef}
                onStart={() => goTo(returnToReview ? total + 1 : 1)}
              />
            )}
            {current >= 1 && current <= total && (
              <QuestionStep
                key={questions[current - 1].id}
                question={questions[current - 1]}
                number={current}
                total={total}
                value={answers[questions[current - 1].id]}
                onAnswer={(value) => setAnswers((a) => ({ ...a, [questions[current - 1].id]: value }))}
                onNext={() => goTo(returnToReview ? total + 1 : current + 1)}
                onBack={() => goTo(current - 1)}
                isLast={current === total}
                returnToReview={returnToReview}
                headingRef={headingRef}
              />
            )}
            {current === total + 1 && (
              <Review
                name={name}
                questions={questions}
                answers={answers}
                headingRef={headingRef}
                submitting={submitting}
                error={submitError}
                onBack={() => goTo(total)}
                onChange={(target) => {
                  setReturnToReview(true);
                  goTo(target);
                }}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

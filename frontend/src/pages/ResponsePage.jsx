import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, CircleAlertIcon } from "lucide-react";
import { api } from "../api/client";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import SeverityBadge from "../components/SeverityBadge";
import { usePageTitle } from "@/hooks/use-page-title";
import { bandPosition } from "@/lib/severity";
import { formatDateTime } from "@/lib/format";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ResponseSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <Skeleton className="h-5 w-64" />
      <Skeleton className="h-9 w-1/2" />
      <Skeleton className="h-36 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

export default function ResponsePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const pageLabel = data ? `Response from ${data.response.participant_name}` : undefined;
  usePageTitle(pageLabel);

  useEffect(() => {
    let ignore = false;
    // The response only has question ids; the survey has the question texts, ranges and scoring bands.
    api.getResponse(id)
      .then((response) => api.getSurvey(response.survey_id).then((survey) => ({ response, survey })))
      .then((result) => !ignore && setData(result))
      .catch((err) => !ignore && setError(err.message));
    return () => {
      ignore = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>This response couldn’t be opened</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <ArrowLeftIcon data-icon="inline-start" />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return <ResponseSkeleton />;

  const { response, survey } = data;
  const questions = [...(survey.scale.questions || [])].sort((a, b) => a.position - b.position);
  const bands = survey.scale.scoring_bands || [];
  const maxScore = questions.reduce((sum, q) => sum + q.max_value, 0);
  const band = response.severity_band;
  const position = bandPosition(bands, band);
  const answers = new Map(response.answers.map((a) => [a.question_id, a.value]));

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: survey.title, to: `/surveys/${survey.id}` },
          { label: pageLabel },
        ]}
      />

      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-3xl break-words">{pageLabel}</h1>
        <p className="m-0 text-sm text-muted-foreground">
          <Link to={`/surveys/${survey.id}`} className="font-medium text-primary hover:underline">{survey.title}</Link>
          {" "}· Submitted {formatDateTime(response.submitted_at)}
        </p>
      </div>

      <Card className="[--card-spacing:--spacing(6)]">
        <CardContent className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="m-0 text-sm text-muted-foreground">Score:</p>
            <p className="m-0 font-heading text-4xl font-semibold tabular-nums">
              {response.score}
              {maxScore > 0 && <span className="text-lg font-medium text-muted-foreground"> out of {maxScore}</span>}
            </p>
          </div>
          {bands.length > 0 && (
            <div className="flex flex-col items-start gap-1 sm:items-end">
              <p className="m-0 text-sm text-muted-foreground">Scoring band</p>
              {band ? (
                <div className="flex items-center gap-2">
                  <SeverityBadge label={band.label} index={position.index} count={position.count} />
                  <span className="text-sm text-muted-foreground tabular-nums">{band.min}–{band.max}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Outside bands</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="m-0 text-lg">Answers</h2>
          </CardTitle>
          <CardDescription>The score is the sum of these answers.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="m-0 flex list-none flex-col divide-y p-0">
            {questions.map((question, index) => {
              const value = answers.get(question.id);
              return (
                <li key={question.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 gap-3">
                    <span className="w-6 shrink-0 text-sm text-muted-foreground tabular-nums">{index + 1}.</span>
                    <span className="text-pretty break-words">{question.text}</span>
                  </div>
                  <div className="shrink-0 text-right tabular-nums">
                    <span className="font-semibold">{value ?? "—"}</span>
                    <span className="block text-xs text-muted-foreground">
                      <span className="sr-only">Answer range </span>
                      {question.min_value}–{question.max_value}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

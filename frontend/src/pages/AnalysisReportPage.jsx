import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, ChevronDownIcon, CircleAlertIcon } from "lucide-react";
import { api } from "../api/client";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import CorrelationReport from "../components/analysis/CorrelationReport";
import DescriptiveReport from "../components/analysis/DescriptiveReport";
import FactorReport from "../components/analysis/FactorReport";
import { usePageTitle } from "@/hooks/use-page-title";
import { analysisType } from "@/lib/analysis";
import { formatDateTime, pluralize } from "@/lib/format";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";

function ReportSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <Skeleton className="h-5 w-64" />
      <Skeleton className="h-9 w-1/2" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

export default function AnalysisReportPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const type = data ? analysisType(data.report.analysis_type) : null;
  const pageLabel = data ? `${type?.name ?? data.report.analysis_type} analysis` : undefined;
  usePageTitle(pageLabel);

  useEffect(() => {
    let ignore = false;
    // The report has the survey title but not its id; the survey has the question texts and ranges.
    Promise.all([api.getAnalysisReport(id), api.getAnalysis(id)])
      .then(([report, analysis]) => api.getSurvey(analysis.survey_id).then((survey) => ({ report, analysis, survey })))
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
          <AlertTitle>This report couldn’t be opened</AlertTitle>
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

  if (!data) return <ReportSkeleton />;

  const { report, analysis, survey } = data;
  const results = report.results || {};
  const questions = [...(survey.scale.questions || [])].sort((a, b) => a.position - b.position);
  const maxScore = questions.reduce((sum, q) => sum + q.max_value, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: survey.title, to: `/surveys/${survey.id}?tab=analyses` },
          { label: pageLabel },
        ]}
      />

      <div className="flex flex-col gap-2">
        <h1 className="m-0 text-3xl break-words">{pageLabel}</h1>
        <p className="m-0 text-sm text-muted-foreground">
          <Link to={`/surveys/${survey.id}?tab=analyses`} className="font-medium text-primary hover:underline">{survey.title}</Link>
          {" "}· Run {formatDateTime(analysis.created_at)} · {analysis.credits_used} credits · Survey has{" "}
          {pluralize(report.total_responses ?? 0, "response")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="m-0 text-lg">Results</h2>
          </CardTitle>
          {type && <CardDescription>{type.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {report.analysis_type === "descriptive" && <DescriptiveReport results={results} maxScore={maxScore} />}
          {report.analysis_type === "correlation" && <CorrelationReport results={results} questions={questions} />}
          {report.analysis_type === "factor" && <FactorReport results={results} questions={questions} />}
        </CardContent>
      </Card>

      <Collapsible className="flex flex-col gap-3">
        <div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="group">
              Show raw data
              <ChevronDownIcon data-icon="inline-end" className="transition-transform group-data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <pre className="m-0 overflow-x-auto rounded-xl border bg-muted/40 p-4 text-sm">{JSON.stringify(results, null, 2)}</pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

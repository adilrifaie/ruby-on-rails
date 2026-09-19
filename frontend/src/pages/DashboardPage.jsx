import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChartColumnIcon,
  CircleAlertIcon,
  ClipboardListIcon,
  CoinsIcon,
  InboxIcon,
  PlusIcon,
  RotateCwIcon,
  SendIcon,
} from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { formatDate, formatNumber, pluralize } from "@/lib/format";
import ScaleStatusBadge from "../components/ScaleStatusBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Enough for a personal dashboard; the tables say so when a list is cut off.
const PAGE_SIZE = 100;

const fetchDashboard = () =>
  Promise.all([api.listScales(1, PAGE_SIZE), api.listSurveys(1, PAGE_SIZE), api.listAnalyses(1, PAGE_SIZE)]).then(
    ([scales, surveys, analyses]) => ({ scales, surveys, analyses })
  );

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <Card className="[--card-spacing:--spacing(5)]">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <Icon className="size-4" aria-hidden="true" />
          {label}
        </CardDescription>
        <CardTitle className="font-heading text-3xl font-semibold tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-pretty text-muted-foreground">{hint}</CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function SectionCard({ title, description, action, children }) {
  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle>
            <h2 className="m-0 text-lg">{title}</h2>
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ScalesTable({ scales }) {
  if (scales.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ClipboardListIcon />
          </EmptyMedia>
          <EmptyTitle>Create your first scale</EmptyTitle>
          <EmptyDescription>
            A scale is a set of questions with answer ranges. Build one, publish it, then share it as a survey.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/scales/new">
              <PlusIcon data-icon="inline-start" />
              New scale
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Identifier</TableHead>
          <TableHead className="hidden sm:table-cell">Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scales.map((scale) => (
          <TableRow key={scale.id}>
            <TableCell className="max-w-64 font-medium">
              <Link to={`/scales/${scale.id}`} className="block truncate text-primary hover:underline">
                {scale.title}
              </Link>
            </TableCell>
            <TableCell>
              <ScaleStatusBadge status={scale.status} />
            </TableCell>
            <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell" translate="no">
              {scale.identifier}
            </TableCell>
            <TableCell className="hidden text-muted-foreground tabular-nums sm:table-cell">{formatDate(scale.created_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SurveysTable({ surveys, hasScales }) {
  if (surveys.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SendIcon />
          </EmptyMedia>
          <EmptyTitle>No surveys yet</EmptyTitle>
          <EmptyDescription>
            {hasScales
              ? "Open a scale, publish it, then create a survey to get a link you can share with participants."
              : "Surveys come from published scales. Create a scale first."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Survey</TableHead>
          <TableHead className="hidden sm:table-cell">Scale</TableHead>
          <TableHead className="text-right">Responses</TableHead>
          <TableHead className="hidden md:table-cell">Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {surveys.map((survey) => (
          <TableRow key={survey.id}>
            <TableCell className="max-w-64 font-medium">
              <Link to={`/surveys/${survey.id}`} className="block truncate text-primary hover:underline">
                {survey.title}
              </Link>
            </TableCell>
            <TableCell className="hidden max-w-56 truncate text-muted-foreground sm:table-cell">{survey.scale.title}</TableCell>
            <TableCell className="text-right tabular-nums">{pluralize(survey.response_count || 0, "response")}</TableCell>
            <TableCell className="hidden text-muted-foreground tabular-nums md:table-cell">{formatDate(survey.created_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RecentAnalyses({ analyses, surveysById }) {
  if (analyses.length === 0) {
    return (
      <p className="m-0 text-sm text-muted-foreground">
        No analyses yet. Open a survey with responses and run one from there.
      </p>
    );
  }

  return (
    <ul className="m-0 flex list-none flex-col divide-y p-0">
      {analyses.map((analysis) => (
        <li key={analysis.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <div className="flex min-w-0 flex-col">
            <Link to={`/analyses/${analysis.id}`} className="truncate font-medium text-primary capitalize hover:underline">
              {analysis.analysis_type} analysis
            </Link>
            <span className="truncate text-sm text-muted-foreground">
              {surveysById[analysis.survey_id]?.title ?? "Survey"} · {formatDate(analysis.created_at)}
            </span>
          </div>
          <Badge variant="outline" className="shrink-0 tabular-nums">
            {analysis.credits_used} credits
          </Badge>
        </li>
      ))}
    </ul>
  );
}

export default function DashboardPage() {
  usePageTitle("Dashboard");
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const retry = () => {
    setError(null);
    fetchDashboard().then(setData).catch((err) => setError(err.message));
  };

  useEffect(() => {
    let ignore = false;
    fetchDashboard()
      .then((result) => !ignore && setData(result))
      .catch((err) => !ignore && setError(err.message));
    return () => {
      ignore = true;
    };
  }, []);

  const scales = data?.scales ?? [];
  const surveys = data?.surveys ?? [];
  const analyses = data?.analyses ?? [];
  const published = scales.filter((s) => s.status === "published").length;
  const totalResponses = surveys.reduce((sum, s) => sum + (s.response_count || 0), 0);
  const surveysById = Object.fromEntries(surveys.map((s) => [s.id, s]));
  const recentAnalyses = [...analyses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-3xl">Dashboard</h1>
          <p className="m-0 text-muted-foreground">Your scales, surveys and analyses in one place.</p>
        </div>
        <Button asChild>
          <Link to="/scales/new">
            <PlusIcon data-icon="inline-start" />
            New scale
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Your dashboard didn’t load</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3">
            {error}
            <Button variant="outline" size="sm" onClick={retry}>
              <RotateCwIcon data-icon="inline-start" />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!data && !error && <DashboardSkeleton />}

      {data && (
        <>
          <section aria-label="Summary" className="mt-0 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard icon={CoinsIcon} label="Credit balance" value={formatNumber(user.credits)} hint="Analyses cost 5, 10 or 15 credits." />
            <StatCard
              icon={ClipboardListIcon}
              label="Scales"
              value={formatNumber(scales.length)}
              hint={`${formatNumber(published)} published · ${formatNumber(scales.length - published)} draft`}
            />
            <StatCard icon={SendIcon} label="Surveys" value={formatNumber(surveys.length)} hint="Each has its own public link." />
            <StatCard icon={InboxIcon} label="Responses" value={formatNumber(totalResponses)} hint="Across all your surveys." />
          </section>

          <SectionCard
            title="Your scales"
            description="Publish a scale when its questions are ready, then create surveys from it."
          >
            <ScalesTable scales={scales} />
            {scales.length === PAGE_SIZE && (
              <p className="mt-3 mb-0 text-sm text-muted-foreground">Showing your first {PAGE_SIZE} scales.</p>
            )}
          </SectionCard>

          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <SectionCard title="Your surveys" description="Open a survey to share its link, review responses and run analyses.">
              <SurveysTable surveys={surveys} hasScales={scales.length > 0} />
            </SectionCard>
            <SectionCard
              title="Recent analyses"
              action={<ChartColumnIcon className="size-5 text-muted-foreground" aria-hidden="true" />}
            >
              <RecentAnalyses analyses={recentAnalyses} surveysById={surveysById} />
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}

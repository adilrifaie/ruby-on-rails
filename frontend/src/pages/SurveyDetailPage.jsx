import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeftIcon, CircleAlertIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api/client";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import AnalysesList from "../components/survey/AnalysesList";
import AnalysisRunner from "../components/survey/AnalysisRunner";
import ResponsesTable from "../components/survey/ResponsesTable";
import ShareLink from "../components/survey/ShareLink";
import { usePageTitle } from "@/hooks/use-page-title";
import { formatDate, formatNumber } from "@/lib/format";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = ["responses", "analyses"];

function Stat({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="m-0 font-heading text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function DeleteSurveyButton({ survey }) {
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await api.destroySurvey(survey.id);
      toast("Survey deleted.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2Icon data-icon="inline-start" />
          Delete survey
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{survey.title}”?</AlertDialogTitle>
          <AlertDialogDescription>Its public link will stop working. This can’t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep survey</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete}>Delete survey</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SurveySkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <Skeleton className="h-5 w-64" />
      <Skeleton className="h-9 w-1/2" />
      <Skeleton className="h-44 rounded-xl" />
      <Skeleton className="h-10 w-64 rounded-full" />
      <Skeleton className="h-56 rounded-xl" />
    </div>
  );
}

export default function SurveyDetailPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  usePageTitle(data?.survey.title);

  const tab = TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "responses";

  useEffect(() => {
    let ignore = false;
    Promise.all([api.getSurvey(id), api.listResponses(id), api.listAnalyses(1, 100)])
      .then(([survey, responses, analyses]) => {
        if (ignore) return;
        setData({ survey, responses, analyses: analyses.filter((a) => a.survey_id === survey.id) });
      })
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
          <AlertTitle>This survey couldn’t be opened</AlertTitle>
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

  if (!data) return <SurveySkeleton />;

  const { survey, responses, analyses } = data;
  const questions = survey.scale.questions || [];
  const bands = survey.scale.scoring_bands || [];
  const minScore = questions.reduce((sum, q) => sum + q.min_value, 0);
  const maxScore = questions.reduce((sum, q) => sum + q.max_value, 0);
  const latest = responses.reduce((max, r) => (r.submitted_at && (!max || r.submitted_at > max) ? r.submitted_at : max), null);
  const publicLink = `${window.location.origin}/take/${survey.id}`;

  return (
    <div className="flex flex-col gap-6">
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: survey.scale.title, to: `/scales/${survey.scale.id}` },
          { label: survey.title },
        ]}
      />

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="m-0 text-3xl break-words">{survey.title}</h1>
          <Badge variant="outline" className="capitalize">{survey.status || "active"}</Badge>
        </div>
        <p className="m-0 text-sm text-muted-foreground">
          From <Link to={`/scales/${survey.scale.id}`} className="font-medium text-primary hover:underline">{survey.scale.title}</Link>
          {" "}· Created {formatDate(survey.created_at)}
        </p>
      </div>

      <Card className="[--card-spacing:--spacing(6)]">
        <CardContent className="flex flex-col gap-6">
          <ShareLink url={publicLink} />
          <dl className="m-0 grid grid-cols-2 gap-4 border-t pt-5 sm:grid-cols-4">
            <Stat label="Responses" value={formatNumber(responses.length)} />
            <Stat label="Questions" value={formatNumber(questions.length)} />
            <Stat label="Score range" value={questions.length ? `${minScore}–${maxScore}` : "—"} />
            <Stat label="Latest response" value={latest ? formatDate(latest) : "—"} />
          </dl>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(value) => setSearchParams(value === "responses" ? {} : { tab: value }, { replace: true })}>
        <TabsList>
          <TabsTrigger value="responses">
            Responses <span className="text-muted-foreground tabular-nums">{responses.length}</span>
          </TabsTrigger>
          <TabsTrigger value="analyses">
            Analyses <span className="text-muted-foreground tabular-nums">{analyses.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="responses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="m-0 text-lg">Responses</h2>
              </CardTitle>
              <CardDescription>
                Each response’s score is the sum of its answers{bands.length ? ", labeled with its scoring band" : ""}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsesTable responses={responses} bands={bands} maxScore={maxScore} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyses" className="mt-4 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="m-0 text-lg">Run an analysis</h2>
              </CardTitle>
              <CardDescription>Analyses use every response submitted so far and are paid for with credits.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalysisRunner
                surveyId={survey.id}
                questions={questions}
                responseCount={responses.length}
                onCreated={(analysis) => setData((d) => ({ ...d, analyses: [...d.analyses, analysis] }))}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <h2 className="m-0 text-lg">Past analyses</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnalysesList analyses={analyses} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {responses.length === 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed p-4">
          <p className="m-0 text-sm text-muted-foreground">Created this survey by mistake? You can delete it until it has responses.</p>
          <DeleteSurveyButton survey={survey} />
        </div>
      )}
    </div>
  );
}

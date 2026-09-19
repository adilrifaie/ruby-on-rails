import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeftIcon, CircleAlertIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api/client";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import ScaleStatusBadge from "../components/ScaleStatusBadge";
import BuilderSteps from "../components/scale-builder/BuilderSteps";
import PublishSection from "../components/scale-builder/PublishSection";
import QuestionsSection from "../components/scale-builder/QuestionsSection";
import ScaleDetailsForm from "../components/scale-builder/ScaleDetailsForm";
import ScoringBandsSection from "../components/scale-builder/ScoringBandsSection";
import { usePageTitle } from "@/hooks/use-page-title";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function Section({ id, title, description, children, footer }) {
  return (
    <Card id={id} className="scroll-mt-24">
      <CardHeader>
        <CardTitle>
          <h2 className="m-0 text-lg">{title}</h2>
        </CardTitle>
        {description && <CardDescription className="text-pretty">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter className="border-t bg-muted/40 py-4">{footer}</CardFooter>}
    </Card>
  );
}

function NewScale() {
  usePageTitle("New scale");
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleCreate = async (values) => {
    setError(null);
    try {
      const created = await api.createScale(values);
      toast.success("Scale created. Now add its questions.");
      navigate(`/scales/${created.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageBreadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: "New scale" }]} />
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-3xl">New scale</h1>
        <p className="m-0 text-muted-foreground">Start with a name. You’ll add questions and scoring bands next.</p>
      </div>
      <Card className="[--card-spacing:--spacing(6)]">
        <CardContent className="flex flex-col gap-4">
          {error && (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <ScaleDetailsForm submitLabel="Create scale" onSubmit={handleCreate} autoFocus />
        </CardContent>
      </Card>
    </div>
  );
}

function DeleteScaleButton({ scale }) {
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await api.destroyScale(scale.id);
      toast("Scale deleted.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2Icon data-icon="inline-start" />
          Delete scale
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{scale.title}”?</AlertDialogTitle>
          <AlertDialogDescription>The scale and its questions will be removed. This can’t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep scale</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete}>Delete scale</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function BuilderSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-9 w-2/3" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
      </div>
      {[0, 1].map((i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
    </div>
  );
}

function ExistingScale({ id }) {
  const [scale, setScale] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [error, setError] = useState(null);
  usePageTitle(scale?.title);

  useEffect(() => {
    // Ignore a response that arrives after this effect was replaced (StrictMode's double run, or a
    // later id); otherwise a stale fetch can overwrite questions added in the meantime.
    let ignore = false;
    Promise.all([api.getScale(id), api.listSurveys(1, 100)])
      .then(([scaleData, allSurveys]) => {
        if (ignore) return;
        setScale(scaleData);
        setSurveys(allSurveys.filter((survey) => survey.scale.id === scaleData.id));
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
          <AlertTitle>This scale couldn’t be opened</AlertTitle>
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

  if (!scale) return <div className="mx-auto max-w-3xl"><BuilderSkeleton /></div>;

  const questions = scale.questions || [];
  const published = scale.status === "published";
  const bandCount = (scale.scoring_bands || []).length;
  // Keep the embedded questions in sync when a section changes them.
  const setQuestions = (next) => setScale((current) => ({ ...current, questions: next }));
  const replaceScale = (updated) => setScale((current) => ({ ...current, ...updated, questions: updated.questions ?? current.questions }));

  const steps = [
    { id: "details", label: "Details", done: true },
    { id: "questions", label: "Questions", done: questions.length > 0 },
    { id: "scoring", label: "Scoring bands", done: bandCount > 0, optional: !published },
    { id: "publish", label: published ? "Share" : "Publish", done: published && surveys.length > 0 },
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageBreadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: scale.title }]} />

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="m-0 text-3xl break-words">{scale.title}</h1>
          <ScaleStatusBadge status={scale.status} />
        </div>
        <p className="m-0 text-sm text-muted-foreground">
          <span className="font-mono" translate="no">{scale.identifier}</span> · Version {scale.version || "1.0"}
        </p>
      </div>

      <BuilderSteps steps={steps} />

      <Section
        id="details"
        title="Details"
        description="The title and description participants see. These stay editable after publishing."
        footer={
          surveys.length > 0 ? (
            <p className="m-0 text-sm text-muted-foreground">
              This scale can’t be deleted while {surveys.length === 1 ? "a survey uses" : "surveys use"} it.
            </p>
          ) : (
            <DeleteScaleButton scale={scale} />
          )
        }
      >
        <ScaleDetailsForm
          key={scale.id}
          initial={scale}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            try {
              replaceScale(await api.updateScale(scale.id, values));
              toast.success("Details saved.");
            } catch (err) {
              toast.error(err.message);
            }
          }}
        />
      </Section>

      <Section
        id="questions"
        title="Questions"
        description="Each question has a range of whole-number answers. A response’s total score is the sum of its answers."
      >
        <QuestionsSection scale={scale} questions={questions} locked={published} onQuestionsChange={setQuestions} />
      </Section>

      <Section
        id="scoring"
        title="Scoring bands"
        description="Bands turn a total score into a label such as Minimal or Severe. They’re optional."
      >
        <ScoringBandsSection
          key={`${scale.id}-${published}`}
          scale={scale}
          questions={questions}
          locked={published}
          onSaved={replaceScale}
        />
      </Section>

      <Section
        id="publish"
        title={published ? "Share with participants" : "Publish"}
        description={
          published
            ? "Create a survey to get a public link. Each survey collects its own responses."
            : "Publish when the questions are final."
        }
      >
        <PublishSection scale={scale} questions={questions} surveys={surveys} onPublished={replaceScale} />
      </Section>
    </div>
  );
}

export default function ScaleBuilderPage() {
  const { id } = useParams();
  return id ? <ExistingScale key={id} id={id} /> : <NewScale />;
}

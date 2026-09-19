import { Link } from "react-router-dom";
import { ArrowRightIcon, ChartColumnIcon, ClipboardListIcon, InfoIcon, Link2Icon } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { usePageTitle } from "@/hooks/use-page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: ClipboardListIcon,
    title: "Scales are data",
    body: "Each scale is its own questions, answer ranges and scoring bands. PHQ-9, GAD-7 or your own instrument, with no custom code.",
  },
  {
    icon: Link2Icon,
    title: "Share a public link",
    body: "Participants answer one question at a time on any device, without creating an account.",
  },
  {
    icon: ChartColumnIcon,
    title: "Analyze with credits",
    body: "Run descriptive statistics, correlations between questions and per-question summaries. Each analysis costs 5–15 credits.",
  },
];

const STEPS = [
  { title: "Build", body: "Write your questions and set each answer range." },
  { title: "Publish", body: "Lock the scale so every response is scored the same way." },
  { title: "Collect", body: "Create a survey and send its link to participants." },
  { title: "Analyze", body: "Review scores and severity bands, then run statistics." },
];

// A static picture of the participant view. Decorative only, so it's hidden from assistive tech.
function SurveyPreview() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-sm select-none">
      <Card className="shadow-xl shadow-foreground/5 [--card-spacing:--spacing(6)]">
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Question 2 of 5</span>
            <span className="tabular-nums">40%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-2/5 rounded-full bg-primary" />
          </div>
          <p className="m-0 font-heading text-lg leading-snug font-semibold text-balance">
            Over the last 2 weeks, how often have you felt down, depressed or hopeless?
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4].map((value) => (
              <span
                key={value}
                className={
                  value === 2
                    ? "flex h-11 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground tabular-nums"
                    : "flex h-11 items-center justify-center rounded-full border bg-card font-medium tabular-nums"
                }
              >
                {value}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card size="sm" className="absolute -right-3 -bottom-16 w-40 shadow-lg shadow-foreground/10 sm:-right-8">
        <CardContent className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Total score</span>
          <span className="font-heading text-2xl font-semibold tabular-nums">7</span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-severity-mild">
            <span className="size-2 rounded-full bg-severity-mild" />
            Mild
          </span>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LandingPage() {
  usePageTitle(undefined);
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-24">
      <section className="relative isolate mt-0 grid items-center gap-16 pt-4 md:grid-cols-[1.1fr_1fr] md:pt-10">
        <div aria-hidden="true" className="bg-dot-grid absolute inset-x-0 -top-16 -bottom-16 -z-10 lg:-inset-x-8" />
        <div className="flex flex-col items-start gap-6">
          <Badge variant="secondary" className="h-7 px-3 text-sm">For researchers and clinicians</Badge>
          <h1 className="m-0 text-4xl leading-[1.1] font-semibold sm:text-5xl">
            Build, share and score healthcare assessment scales
          </h1>
          <p className="m-0 max-w-xl text-lg text-pretty text-muted-foreground">
            Design a scale once with its questions and scoring bands. Collect responses through a public link,
            see each participant’s score and severity, and analyze the results.
          </p>
          <div className="flex flex-wrap gap-3">
            {user ? (
              <Button asChild size="lg">
                <Link to="/dashboard">
                  Go to dashboard
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link to="/register">
                    Create an account
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/login">Log in</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <SurveyPreview />
      </section>

      <section aria-labelledby="features-heading" className="mt-0 flex flex-col gap-8">
        <h2 id="features-heading" className="m-0 text-2xl">Everything a screening study needs</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <CardHeader>
                <span className="mb-2 flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground" aria-hidden="true">
                  <Icon className="size-5" />
                </span>
                <CardTitle>
                  <h3 className="m-0 text-base">{title}</h3>
                </CardTitle>
                <CardDescription className="text-pretty">{body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="steps-heading" className="mt-0 flex flex-col gap-8">
        <h2 id="steps-heading" className="m-0 text-2xl">How it works</h2>
        <ol className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 md:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-2 border-t-2 border-primary pt-4">
              <span className="text-sm font-medium text-primary tabular-nums">Step {index + 1}</span>
              <span className="font-heading text-lg font-semibold">{step.title}</span>
              <span className="text-sm text-pretty text-muted-foreground">{step.body}</span>
            </li>
          ))}
        </ol>
      </section>

      <footer className="flex flex-col gap-4 border-t pt-8 text-sm text-muted-foreground">
        <p className="m-0 flex items-start gap-2 text-pretty">
          <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Scores are screening aids, not a diagnosis. Interpret results alongside clinical judgment.
        </p>
        <p className="m-0 text-pretty">
          Started as a YZM301 Software Implementation and Testing course project, then rebuilt as a full-stack
          Ruby on Rails and React platform.{" "}
          <a href="https://github.com/adilrifaie/ruby-on-rails" className="font-medium text-primary" translate="no">
            View source on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

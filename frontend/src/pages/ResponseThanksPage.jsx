import { useLocation } from "react-router-dom";
import { CircleCheckIcon, InfoIcon } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import { Card, CardContent } from "@/components/ui/card";

export default function ResponseThanksPage() {
  usePageTitle("Thank you");
  const { state } = useLocation();
  const score = state?.score;

  return (
    <div className="mx-auto max-w-xl">
      <Card className="[--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
        <CardContent className="flex flex-col items-center gap-6 text-center">
          <span className="flex size-14 animate-in items-center justify-center rounded-full bg-secondary text-secondary-foreground duration-500 ease-out zoom-in-75 fade-in" aria-hidden="true">
            <CircleCheckIcon className="size-7" />
          </span>
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-2xl text-balance sm:text-3xl">Thanks for completing the survey</h1>
            <p className="m-0 text-pretty text-muted-foreground">
              {state?.title ? <>Your answers to “{state.title}” have been sent.</> : "Your response has been recorded."} You can close
              this page now.
            </p>
          </div>

          {score !== undefined && (
            <div className="w-full animate-in rounded-xl border bg-muted/40 px-6 py-5 delay-200 duration-500 ease-out fill-mode-both fade-in slide-in-from-bottom-2">
              <p className="m-0 text-sm text-muted-foreground">Your score:</p>
              <p className="m-0 font-heading text-4xl font-semibold tabular-nums">
                {score}
                {state?.maxScore > 0 && <span className="text-lg font-medium text-muted-foreground"> out of {state.maxScore}</span>}
              </p>
            </div>
          )}

          <p className="m-0 flex items-start gap-2 text-left text-sm text-pretty text-muted-foreground">
            <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              This score is a screening aid, not a diagnosis. If you’re worried about how you feel, talk to a doctor or another
              healthcare professional. If you need urgent help, contact your local emergency number.
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

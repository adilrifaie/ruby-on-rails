import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AppHeader from "./components/AppHeader";
import { Toaster } from "@/components/ui/sonner";
import RequireAuth from "./auth/RequireAuth";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ScaleBuilderPage from "./pages/ScaleBuilderPage";
import SurveyDetailPage from "./pages/SurveyDetailPage";
import PublicSurveyPage from "./pages/PublicSurveyPage";
import ResponseThanksPage from "./pages/ResponseThanksPage";
import ResponsePage from "./pages/ResponsePage";
import AnalysisReportPage from "./pages/AnalysisReportPage";

// Participant-facing pages get a minimal header with no account navigation.
const isParticipantPath = (pathname) => pathname.startsWith("/take/") || /^\/responses\/[^/]+\/thanks$/.test(pathname);

// Replays the page-enter animation when moving to a different kind of page. "/scales/new" → "/scales/5" is the
// same page, so it isn't remounted (that would refetch and flash the skeleton).
const pageKey = (pathname) => (/\/thanks$/.test(pathname) ? "thanks" : pathname.split("/")[1] || "home");

export default function App() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main"
        className="sr-only rounded-full bg-primary text-sm font-medium text-primary-foreground no-underline focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <AppHeader minimal={isParticipantPath(pathname)} />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-[max(1rem,env(safe-area-inset-left))] pt-8 pb-16 outline-none">
        <div key={pageKey(pathname)} className="animate-in duration-300 ease-out fade-in slide-in-from-bottom-2">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/take/:id" element={<PublicSurveyPage />} />
            <Route path="/responses/:id/thanks" element={<ResponseThanksPage />} />

            <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
            <Route path="/scales/new" element={<RequireAuth><ScaleBuilderPage /></RequireAuth>} />
            <Route path="/scales/:id" element={<RequireAuth><ScaleBuilderPage /></RequireAuth>} />
            <Route path="/surveys/:id" element={<RequireAuth><SurveyDetailPage /></RequireAuth>} />
            <Route path="/responses/:id" element={<RequireAuth><ResponsePage /></RequireAuth>} />
            <Route path="/analyses/:id" element={<RequireAuth><AnalysisReportPage /></RequireAuth>} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}

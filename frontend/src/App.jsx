import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import RequireAuth from "./auth/RequireAuth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ScaleBuilderPage from "./pages/ScaleBuilderPage";
import SurveyDetailPage from "./pages/SurveyDetailPage";
import PublicSurveyPage from "./pages/PublicSurveyPage";
import ResponseThanksPage from "./pages/ResponseThanksPage";
import ResponsePage from "./pages/ResponsePage";
import AnalysisReportPage from "./pages/AnalysisReportPage";

export default function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import { usePageTitle } from "@/hooks/use-page-title";

export default function AnalysisReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [surveyId, setSurveyId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const pageLabel = report ? `${report.analysis_type} analysis` : undefined;
  usePageTitle(pageLabel);

  useEffect(() => {
    // The report has the survey title but not its id, which the breadcrumb link needs.
    Promise.all([api.getAnalysisReport(id), api.getAnalysis(id)])
      .then(([reportData, analysis]) => {
        setReport(reportData);
        setSurveyId(analysis.survey_id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!report) return null;

  return (
    <div className="analysis-report">
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: report.survey_title, to: `/surveys/${surveyId}` },
          { label: pageLabel },
        ]}
      />
      <h1>{report.survey_title}</h1>
      <p>Analysis type: <strong>{report.analysis_type}</strong> · {report.total_responses} responses</p>
      <pre className="report-json">{JSON.stringify(report.results, null, 2)}</pre>
      <p><Link to="/dashboard">Back to dashboard</Link></p>
    </div>
  );
}

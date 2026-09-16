import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";

export default function AnalysisReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalysisReport(id)
      .then(setReport)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!report) return null;

  return (
    <div className="analysis-report">
      <h1>{report.survey_title}</h1>
      <p>Analysis type: <strong>{report.analysis_type}</strong> · {report.total_responses} responses</p>
      <pre className="report-json">{JSON.stringify(report.results, null, 2)}</pre>
      <p><Link to="/dashboard">Back to dashboard</Link></p>
    </div>
  );
}

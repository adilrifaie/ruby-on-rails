import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import { usePageTitle } from "@/hooks/use-page-title";

export default function ResponsePage() {
  const { id } = useParams();
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const pageLabel = response ? `Response from ${response.participant_name}` : undefined;
  usePageTitle(pageLabel);

  useEffect(() => {
    api.getResponse(id)
      .then(setResponse)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!response) return null;

  return (
    <div className="response-detail">
      <PageBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Survey", to: `/surveys/${response.survey_id}` },
          { label: pageLabel },
        ]}
      />
      <h1>Response from {response.participant_name}</h1>
      <p>Submitted: {new Date(response.submitted_at).toLocaleString()}</p>
      <p>Score: <strong>{response.score}</strong></p>
      <p>Severity band: <strong>{response.severity_band}</strong></p>

      <h2>Answers</h2>
      <ul className="card-list">
        {response.answers.map((a) => (
          <li key={a.question_id}>Question {a.question_id}: {a.value}</li>
        ))}
      </ul>

      <p><Link to="/dashboard">Back to dashboard</Link></p>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";

export default function SurveyDetailPage() {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [analysisType, setAnalysisType] = useState("descriptive");
  const [questionAId, setQuestionAId] = useState("");
  const [questionBId, setQuestionBId] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalyses = () => {
    api.listAnalyses().then((all) => setAnalyses(all.filter((a) => a.survey_id === Number(id))));
  };

  useEffect(() => {
    Promise.all([api.getSurvey(id), api.listAnalyses(), api.listResponses(id)])
      .then(([surveyData, analysesData, responsesData]) => {
        setSurvey(surveyData);
        setAnalyses(analysesData.filter((a) => a.survey_id === Number(id)));
        setResponses(responsesData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const params = { survey_id: id, analysis_type: analysisType };
      if (analysisType === "correlation") {
        params.question_a_id = questionAId;
        params.question_b_id = questionBId;
      }
      await api.createAnalysis(params);
      loadAnalyses();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!survey) return null;

  const questions = survey.scale.questions || [];
  const publicLink = `${window.location.origin}/take/${survey.id}`;

  return (
    <div className="survey-detail">
      <h1>{survey.title}</h1>
      <p>Scale: {survey.scale.title} · {survey.response_count || 0} responses</p>

      <section>
        <h2>Public link</h2>
        <input readOnly value={publicLink} onFocus={(e) => e.target.select()} />
      </section>

      <section>
        <h2>Responses</h2>
        {responses.length === 0 ? (
          <p>No responses yet.</p>
        ) : (
          <ul className="card-list">
            {responses.map((r) => (
              <li key={r.id}>
                <Link to={`/responses/${r.id}`}>{r.participant_name}</Link>
                <span>score {r.score} · {r.severity_band}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Run analysis</h2>
        <form onSubmit={handleRunAnalysis} className="inline-form">
          <label>
            Type
            <select value={analysisType} onChange={(e) => setAnalysisType(e.target.value)}>
              <option value="descriptive">Descriptive</option>
              <option value="correlation">Correlation</option>
              <option value="factor">Factor</option>
            </select>
          </label>
          {analysisType === "correlation" && (
            <>
              <label>
                Question A
                <select value={questionAId} onChange={(e) => setQuestionAId(e.target.value)} required>
                  <option value="">Select...</option>
                  {questions.map((q) => <option key={q.id} value={q.id}>{q.text}</option>)}
                </select>
              </label>
              <label>
                Question B
                <select value={questionBId} onChange={(e) => setQuestionBId(e.target.value)} required>
                  <option value="">Select...</option>
                  {questions.map((q) => <option key={q.id} value={q.id}>{q.text}</option>)}
                </select>
              </label>
            </>
          )}
          <button type="submit">Run analysis</button>
        </form>
        {error && <p className="error">{error}</p>}

        <ul className="card-list">
          {analyses.map((a) => (
            <li key={a.id}>
              <Link to={`/analyses/${a.id}`}>{a.analysis_type}</Link>
              <span>{a.credits_used} credits</span>
            </li>
          ))}
        </ul>
      </section>

      <p><Link to="/dashboard">Back to dashboard</Link></p>
    </div>
  );
}

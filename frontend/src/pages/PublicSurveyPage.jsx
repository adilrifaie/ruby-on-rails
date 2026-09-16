import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function PublicSurveyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState(null);
  const [participantName, setParticipantName] = useState("");
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getSurvey(id, { auth: false })
      .then((data) => setSurvey(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: Number(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const questions = survey.scale.questions || [];
    if (questions.some((q) => answers[q.id] === undefined)) {
      setError("Please answer every question.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.createResponse({
        survey_id: survey.id,
        participant_name: participantName,
        submitted_at: new Date().toISOString(),
        answers_attributes: questions.map((q) => ({ question_id: q.id, value: answers[q.id] })),
      });
      navigate(`/responses/${result.response.id}/thanks`, { state: { score: result.score } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error && !survey) return <p className="error">{error}</p>;
  if (!survey) return null;

  const questions = (survey.scale.questions || []).slice().sort((a, b) => a.position - b.position);

  return (
    <div className="public-survey">
      <h1>{survey.title}</h1>
      <p>{survey.scale.description}</p>

      <form onSubmit={handleSubmit}>
        <label>
          Your name
          <input value={participantName} onChange={(e) => setParticipantName(e.target.value)} required />
        </label>

        {questions.map((q) => (
          <div key={q.id} className="question-block">
            <p>{q.position}. {q.text}</p>
            <input
              type="number"
              min={q.min_value}
              max={q.max_value}
              value={answers[q.id] ?? ""}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              required
            />
            <span className="hint">({q.min_value}-{q.max_value})</span>
          </div>
        ))}

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</button>
      </form>
    </div>
  );
}

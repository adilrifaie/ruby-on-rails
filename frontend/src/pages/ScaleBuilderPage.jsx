import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../api/client";

const emptyQuestion = { text: "", position: 1, min_value: 0, max_value: 4 };

export default function ScaleBuilderPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [scale, setScale] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("1.0");
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState(emptyQuestion);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [newSurveyTitle, setNewSurveyTitle] = useState("");

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    api.getScale(id)
      .then((data) => {
        setScale(data);
        setTitle(data.title);
        setDescription(data.description || "");
        setVersion(data.version || "1.0");
        setQuestions(data.questions || []);
        setNewQuestion({ ...emptyQuestion, position: (data.questions?.length || 0) + 1 });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const handleSaveScale = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isNew) {
        const created = await api.createScale({ title, description, version });
        navigate(`/scales/${created.id}`);
      } else {
        const updated = await api.updateScale(id, { title, description, version });
        setScale(updated);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const created = await api.createQuestion(id, newQuestion);
      setQuestions([...questions, created]);
      setNewQuestion({ ...emptyQuestion, position: questions.length + 2 });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    setError(null);
    try {
      await api.destroyQuestion(id, questionId);
      setQuestions(questions.filter((q) => q.id !== questionId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePublish = async () => {
    setError(null);
    try {
      const updated = await api.publishScale(id);
      setScale(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const created = await api.createSurvey({ scale_id: id, title: newSurveyTitle, status: "active" });
      navigate(`/surveys/${created.survey.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="scale-builder">
      <h1>{isNew ? "New scale" : scale?.title}</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSaveScale} className="inline-form">
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label>
          Version
          <input value={version} onChange={(e) => setVersion(e.target.value)} />
        </label>
        <button type="submit">{isNew ? "Create scale" : "Save changes"}</button>
      </form>

      {!isNew && scale && (
        <>
          <section>
            <div className="section-header">
              <h2>Questions</h2>
              <span className={`badge badge-${scale.status}`}>{scale.status}</span>
            </div>
            <ul className="card-list">
              {questions.sort((a, b) => a.position - b.position).map((q) => (
                <li key={q.id}>
                  <span>{q.position}. {q.text} ({q.min_value}-{q.max_value})</span>
                  <button type="button" onClick={() => handleDeleteQuestion(q.id)}>Delete</button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleAddQuestion} className="inline-form">
              <label>
                Text
                <input value={newQuestion.text} onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })} required />
              </label>
              <label>
                Position
                <input type="number" value={newQuestion.position} onChange={(e) => setNewQuestion({ ...newQuestion, position: Number(e.target.value) })} required />
              </label>
              <label>
                Min value
                <input type="number" value={newQuestion.min_value} onChange={(e) => setNewQuestion({ ...newQuestion, min_value: Number(e.target.value) })} required />
              </label>
              <label>
                Max value
                <input type="number" value={newQuestion.max_value} onChange={(e) => setNewQuestion({ ...newQuestion, max_value: Number(e.target.value) })} required />
              </label>
              <button type="submit">Add question</button>
            </form>
          </section>

          <section>
            <h2>Publish & distribute</h2>
            {scale.status !== "published" ? (
              <button type="button" onClick={handlePublish} disabled={questions.length === 0}>
                Publish scale
              </button>
            ) : (
              <form onSubmit={handleCreateSurvey} className="inline-form">
                <label>
                  New survey title
                  <input value={newSurveyTitle} onChange={(e) => setNewSurveyTitle(e.target.value)} required />
                </label>
                <button type="submit">Create survey</button>
              </form>
            )}
          </section>

          <p><Link to="/dashboard">Back to dashboard</Link></p>
        </>
      )}
    </div>
  );
}

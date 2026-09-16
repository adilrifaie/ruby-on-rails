import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [scales, setScales] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.listScales(), api.listSurveys()])
      .then(([scalesData, surveysData]) => {
        setScales(scalesData.filter((s) => s.user.id === user.id));
        setSurveys(surveysData.filter((s) => s.user.id === user.id));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Credit balance: <strong>{user.credits}</strong></p>
      {error && <p className="error">{error}</p>}

      <section>
        <div className="section-header">
          <h2>Your scales</h2>
          <Link to="/scales/new">+ New scale</Link>
        </div>
        {scales.length === 0 ? (
          <p>No scales yet.</p>
        ) : (
          <ul className="card-list">
            {scales.map((scale) => (
              <li key={scale.id}>
                <Link to={`/scales/${scale.id}`}>{scale.title}</Link>
                <span className={`badge badge-${scale.status}`}>{scale.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Your surveys</h2>
        {surveys.length === 0 ? (
          <p>No surveys yet. Publish a scale to create one.</p>
        ) : (
          <ul className="card-list">
            {surveys.map((survey) => (
              <li key={survey.id}>
                <Link to={`/surveys/${survey.id}`}>{survey.title}</Link>
                <span>{survey.response_count || 0} responses</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

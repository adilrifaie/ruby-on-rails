import { useLocation } from "react-router-dom";

export default function ResponseThanksPage() {
  const location = useLocation();
  const score = location.state?.score;

  return (
    <div className="form-page">
      <h1>Thanks for completing the survey</h1>
      {score !== undefined ? <p>Your score: <strong>{score}</strong></p> : <p>Your response has been recorded.</p>}
    </div>
  );
}

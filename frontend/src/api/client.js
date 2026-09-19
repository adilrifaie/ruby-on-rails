const BASE_URL = import.meta.env.VITE_API_BASE_URL;

let token = localStorage.getItem("token") || null;

export function setToken(newToken) {
  token = newToken;
  if (newToken) {
    localStorage.setItem("token", newToken);
  } else {
    localStorage.removeItem("token");
  }
}

export function getToken() {
  return token;
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error || data?.errors ? JSON.stringify(data.error || data.errors) : `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
}

export const api = {
  login: (email, password) => request("/session", { method: "POST", body: { email, password }, auth: false }),
  register: (email, password) => request("/users", { method: "POST", body: { user: { email, password } }, auth: false }),
  getUser: (id) => request(`/users/${id}`),
  updateProfile: (id, params) => request(`/users/${id}`, { method: "PATCH", body: { user: params } }),

  listScales: (page = 1) => request(`/scales?page=${page}`),
  getScale: (id) => request(`/scales/${id}`),
  createScale: (params) => request("/scales", { method: "POST", body: { scale: params } }),
  updateScale: (id, params) => request(`/scales/${id}`, { method: "PATCH", body: { scale: params } }),
  destroyScale: (id) => request(`/scales/${id}`, { method: "DELETE" }),
  publishScale: (id) => request(`/scales/${id}/publish`, { method: "PATCH" }),

  createQuestion: (scaleId, params) => request(`/scales/${scaleId}/questions`, { method: "POST", body: { question: params } }),
  updateQuestion: (id, params) => request(`/questions/${id}`, { method: "PATCH", body: { question: params } }),
  destroyQuestion: (scaleId, id) => request(`/scales/${scaleId}/questions/${id}`, { method: "DELETE" }),

  listSurveys: (page = 1) => request(`/surveys?page=${page}`),
  getSurvey: (id, { auth = true } = {}) => request(`/surveys/${id}`, { auth }),
  createSurvey: (params) => request("/surveys", { method: "POST", body: { survey: params } }),
  updateSurvey: (id, params) => request(`/surveys/${id}`, { method: "PATCH", body: { survey: params } }),
  destroySurvey: (id) => request(`/surveys/${id}`, { method: "DELETE" }),

  createResponse: (params) => request("/responses", { method: "POST", body: { response: params }, auth: false }),
  getResponse: (id) => request(`/responses/${id}`),
  listResponses: (surveyId) => request(`/responses?survey_id=${surveyId}`),

  listAnalyses: (page = 1) => request(`/analyses?page=${page}`),
  getAnalysis: (id) => request(`/analyses/${id}`),
  createAnalysis: (params) => request("/analyses", { method: "POST", body: { analysis: params } }),
  getAnalysisReport: (id) => request(`/analyses/${id}/report`),
};

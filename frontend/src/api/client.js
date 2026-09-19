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

const GENERIC_MESSAGES = {
  Unauthorized: "Your session has expired. Log in again to continue.",
  Forbidden: "You don't have access to this. It belongs to another account.",
  "Not found": "This item doesn't exist or was removed.",
};

const sentence = (text) => {
  const trimmed = text.trim();
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
};

const humanizeField = (field) => field.replace(/_id$/, "").replace(/_/g, " ");

// Turns the API's {error: "..."} or {errors: {field: ["msg"]}} into one readable sentence per problem.
function errorMessage(data, status) {
  if (typeof data?.error === "string") return GENERIC_MESSAGES[data.error] || sentence(data.error);
  if (data?.errors && typeof data.errors === "object") {
    return Object.entries(data.errors)
      .flatMap(([field, messages]) => [].concat(messages).map((msg) => sentence(field === "base" ? msg : `${humanizeField(field)} ${msg}`)))
      .join(" ");
  }
  return `Something went wrong (error ${status}). Try again in a moment.`;
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(errorMessage(data, res.status));
    error.status = res.status;
    // Per-field messages ({ email: ["has already been taken"] }) so forms can show them next to inputs.
    error.fields = data?.errors && typeof data.errors === "object" ? data.errors : {};
    throw error;
  }

  return data;
}

export const api = {
  login: (email, password) => request("/session", { method: "POST", body: { email, password }, auth: false }),
  register: (email, password) => request("/users", { method: "POST", body: { user: { email, password } }, auth: false }),
  getUser: (id) => request(`/users/${id}`),
  updateProfile: (id, params) => request(`/users/${id}`, { method: "PATCH", body: { user: params } }),

  listScales: (page = 1, per = 25) => request(`/scales?page=${page}&per=${per}`),
  getScale: (id) => request(`/scales/${id}`),
  createScale: (params) => request("/scales", { method: "POST", body: { scale: params } }),
  updateScale: (id, params) => request(`/scales/${id}`, { method: "PATCH", body: { scale: params } }),
  destroyScale: (id) => request(`/scales/${id}`, { method: "DELETE" }),
  publishScale: (id) => request(`/scales/${id}/publish`, { method: "PATCH" }),

  createQuestion: (scaleId, params) => request(`/scales/${scaleId}/questions`, { method: "POST", body: { question: params } }),
  updateQuestion: (scaleId, id, params) => request(`/scales/${scaleId}/questions/${id}`, { method: "PATCH", body: { question: params } }),
  destroyQuestion: (scaleId, id) => request(`/scales/${scaleId}/questions/${id}`, { method: "DELETE" }),

  listSurveys: (page = 1, per = 25) => request(`/surveys?page=${page}&per=${per}`),
  getSurvey: (id, { auth = true } = {}) => request(`/surveys/${id}`, { auth }),
  createSurvey: (params) => request("/surveys", { method: "POST", body: { survey: params } }),
  updateSurvey: (id, params) => request(`/surveys/${id}`, { method: "PATCH", body: { survey: params } }),
  destroySurvey: (id) => request(`/surveys/${id}`, { method: "DELETE" }),

  createResponse: (params) => request("/responses", { method: "POST", body: { response: params }, auth: false }),
  getResponse: (id) => request(`/responses/${id}`),
  listResponses: (surveyId) => request(`/responses?survey_id=${surveyId}`),

  listAnalyses: (page = 1, per = 25) => request(`/analyses?page=${page}&per=${per}`),
  getAnalysis: (id) => request(`/analyses/${id}`),
  createAnalysis: (params) => request("/analyses", { method: "POST", body: { analysis: params } }),
  getAnalysisReport: (id) => request(`/analyses/${id}/report`),
};

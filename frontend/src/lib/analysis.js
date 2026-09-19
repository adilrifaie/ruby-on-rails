// Analysis types and their credit costs. Costs mirror Analysis::CREDIT_COSTS on the API.
export const ANALYSIS_TYPES = [
  {
    value: "descriptive",
    name: "Descriptive",
    cost: 5,
    description: "Mean, median, standard deviation and range of total scores.",
  },
  {
    value: "correlation",
    name: "Correlation",
    cost: 10,
    description: "How strongly answers to two questions move together (Pearson’s r).",
  },
  {
    value: "factor",
    name: "Factor summary",
    cost: 15,
    description: "Average, lowest and highest answer for every question.",
  },
];

export const analysisType = (value) => ANALYSIS_TYPES.find((type) => type.value === value);

// Locale-aware, trailing zeros dropped: 6.5, 7, 0.412.
export const round = (value, digits = 2) =>
  value == null ? "—" : new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(value);

// A one-line summary of an analysis result for lists.
export function summarizeResults(analysis) {
  const r = analysis.results || {};
  switch (analysis.analysis_type) {
    case "descriptive":
      return r.n ? `n = ${r.n} · mean ${round(r.mean)} · SD ${round(r.std_dev)}` : "No responses at the time";
    case "correlation":
      return r.coefficient == null ? `Not enough paired answers (n = ${r.n ?? 0})` : `r = ${round(r.coefficient, 3)} · n = ${r.n}`;
    case "factor":
      return `${r.questions?.length ?? 0} questions summarized`;
    default:
      return "";
  }
}

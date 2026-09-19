// Locale-aware formatting helpers (the viewer's browser locale decides the format).
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const dateTimeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
const numberFormat = new Intl.NumberFormat();

export const formatDate = (value) => (value ? dateFormat.format(new Date(value)) : "—");
export const formatDateTime = (value) => (value ? dateTimeFormat.format(new Date(value)) : "—");
export const formatNumber = (value) => numberFormat.format(value ?? 0);

// "1 response" / "3 responses"
export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${formatNumber(count)} ${count === 1 ? singular : plural}`;

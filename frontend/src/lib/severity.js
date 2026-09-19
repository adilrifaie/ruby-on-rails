// Number of severity tones in the theme (minimal, mild, moderate, severe).
export const TONE_COUNT = 4;

// Maps a band's position (lowest scores first) onto the four severity tones, so a 2-band scale
// uses the ends of the ramp and a 4-band scale uses all of it.
export function severityTone(index, count) {
  if (count <= 1) return 0;
  return Math.round((index * (TONE_COUNT - 1)) / (count - 1));
}

// Finds the band for a severity_band object returned by the API, with its position for coloring.
export function bandPosition(bands, band) {
  const sorted = [...(bands || [])].sort((a, b) => a.min - b.min);
  const index = sorted.findIndex((b) => b.label === band?.label && b.min === band?.min);
  return { index: Math.max(index, 0), count: Math.max(sorted.length, 1) };
}

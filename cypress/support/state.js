// Shared scenario state, reset before each scenario in common.js
export const state = {};

export function resetState() {
  Object.keys(state).forEach((key) => delete state[key]);
}

export const API_NAMES = ["api","compute","objects"] as const;

export type ApiName = (typeof API_NAMES)[number];

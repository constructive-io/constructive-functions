export const API_NAMES = ["infra"] as const;

export type ApiName = (typeof API_NAMES)[number];

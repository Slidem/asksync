export type SharedConfig = {
  appName: string;
  version: string;
};

export const defaultConfig: SharedConfig = {
  appName: "AskSync",
  version: "0.0.0",
};

// Export all types
export * from "./tags/sorting";
export * from "./tags/filtering";
export * from "./common/sorting";
export * from "./types";

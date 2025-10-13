export type SharedConfig = {
  appName: string;
  version: string;
};

export const defaultConfig: SharedConfig = {
  appName: "AskSync",
  version: "0.0.0",
};

// Export all types
export * from "./types";

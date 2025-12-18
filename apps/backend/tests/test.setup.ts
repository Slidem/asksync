/* eslint-disable @typescript-eslint/no-explicit-any */
export const testModules: Record<string, () => Promise<any>> = import.meta.glob(
  "../convex/**/!(*.*.*)*.*s",
) as Record<string, () => Promise<any>>;

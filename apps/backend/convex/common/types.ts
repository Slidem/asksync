export type PatchValue<T> = {
  [P in keyof T]?: undefined extends T[P] ? T[P] | undefined : T[P];
};
export interface TimeOption {
  value: string;
  label: string;
}

export type Permission = "view" | "edit" | "manage";

export interface User {
  id: string;
  email?: string;
  name?: string;
  orgId: string;
  role: "admin" | "member" | "guest";
}

export interface UserWithGroups extends User {
  groupIds: string[];
}

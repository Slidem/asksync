export type PatchValue<T> = {
  [P in keyof T]?: undefined extends T[P] ? T[P] | undefined : T[P];
};
export interface TimeOption {
  value: string;
  label: string;
}

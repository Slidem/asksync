// eslint-disable-next-line import/no-relative-parent-imports
import { SortOrder } from "../common/sorting";

export enum SortBy {
  NAME = "name",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
}

export interface Sorting {
  sortBy: SortBy;
  sortOrder: SortOrder;
}

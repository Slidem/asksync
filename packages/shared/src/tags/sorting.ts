// eslint-disable-next-line import/no-relative-parent-imports
import { SortOrder } from "../common/sorting";

export enum TagSortBy {
  NAME = "name",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
}

export interface TagSorting {
  sortBy: TagSortBy;
  sortOrder: SortOrder;
}

export enum SearchTagCategory {
  ALL = "all",
  PERSONAL = "personal",
  PUBLIC = "public",
}

export interface TagFilters {
  searchTerm?: string;
  category?: SearchTagCategory;
}

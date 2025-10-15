export enum SearchTagCategory {
  ALL = "all",
  PERSONAL = "personal",
  PUBLIC = "public",
}

export interface Filters {
  searchTerm?: string;
  category?: SearchTagCategory;
}

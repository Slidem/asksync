// Google Calendar API types

export interface GoogleEventDateTime {
  dateTime?: string; // RFC 3339 format for timed events
  date?: string; // YYYY-MM-DD for all-day events
  timeZone?: string;
}

export interface GoogleEventData {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: GoogleEventDateTime;
  end: GoogleEventDateTime;
  recurrence?: string[];
  status: "confirmed" | "tentative" | "cancelled";
  updated: string;
  htmlLink?: string;
}

export interface GoogleEventsListResponse {
  kind: string;
  etag: string;
  summary?: string;
  updated?: string;
  timeZone?: string;
  accessRole?: string;
  nextPageToken?: string;
  nextSyncToken?: string;
  items?: GoogleEventData[];
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export interface SyncResult {
  created: number;
  updated: number;
  deleted: number;
  errors: string[];
}

export type GoogleCalendarVisibility = "public" | "hidden";
export type GoogleSyncStatus = "active" | "error" | "disconnected";

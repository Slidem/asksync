// Gmail API types

export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessagePayload {
  headers: GmailMessageHeader[];
  mimeType?: string;
  body?: {
    data?: string;
    size?: number;
  };
  parts?: GmailMessagePayload[];
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet: string;
  payload: GmailMessagePayload;
  internalDate: string; // timestamp in ms as string
  sizeEstimate?: number;
}

export interface GmailMessageListItem {
  id: string;
  threadId: string;
}

export interface GmailMessagesListResponse {
  messages?: GmailMessageListItem[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export interface GmailHistoryMessage {
  message: {
    id: string;
    threadId: string;
    labelIds?: string[];
  };
}

export interface GmailHistoryRecord {
  id: string;
  messagesAdded?: GmailHistoryMessage[];
}

export interface GmailHistoryResponse {
  history?: GmailHistoryRecord[];
  historyId: string;
  nextPageToken?: string;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
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

export interface ParsedEmail {
  sender: string;
  senderName?: string;
  subject: string;
  body: string;
  receivedAt: number;
}

export type GmailSyncStatus = "active" | "error" | "disconnected";

import { Doc } from "../_generated/dataModel";
import { GoogleEventData } from "./types";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

/**
 * Refresh Google OAuth access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; expiresAt: number }> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Check if access token needs refresh (expires within 5 minutes)
 */
export function tokenNeedsRefresh(tokenExpiresAt: number): boolean {
  const bufferMs = 5 * 60 * 1000; // 5 minutes
  return tokenExpiresAt < Date.now() + bufferMs;
}

/**
 * Parse Google event datetime to timestamp
 */
export function parseGoogleEventTime(
  eventTime: GoogleEventData["start"],
): number {
  if (eventTime.dateTime) {
    return new Date(eventTime.dateTime).getTime();
  }
  // All-day event - use date string
  if (eventTime.date) {
    return new Date(eventTime.date).getTime();
  }
  throw new Error("Event has no valid start/end time");
}

/**
 * Map Google event to timeblock data
 */
export function mapGoogleEventToTimeblock(
  googleEvent: GoogleEventData,
  connection: Doc<"googleCalendarConnections">,
): {
  title: string;
  description?: string;
  location?: string;
  startTime: number;
  endTime: number;
  timezone: string;
  source: "google";
  externalId: string;
  createdBy: string;
  orgId: string;
  tagIds: string[];
  updatedAt: number;
} {
  const startTime = parseGoogleEventTime(googleEvent.start);
  const endTime = parseGoogleEventTime(googleEvent.end);
  const timezone =
    googleEvent.start.timeZone || googleEvent.end.timeZone || "UTC";

  return {
    title: googleEvent.summary || "(No title)",
    description: googleEvent.description,
    location: googleEvent.location,
    startTime,
    endTime,
    timezone,
    source: "google",
    externalId: googleEvent.id,
    createdBy: connection.userId,
    orgId: connection.orgId,
    tagIds: [], // Google events don't have tags initially
    updatedAt: Date.now(),
  };
}

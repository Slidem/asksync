import { Doc } from "../_generated/dataModel";
import { GmailMessage, ParsedEmail } from "./types";

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
      client_id: process.env.GMAIL_CLIENT_ID!,
      client_secret: process.env.GMAIL_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Check if access token needs refresh (expires within 5 minutes)
 */
export function tokenNeedsRefresh(tokenExpiresAt: number): boolean {
  const bufferMs = 5 * 60 * 1000;
  return tokenExpiresAt < Date.now() + bufferMs;
}

/**
 * Parse Gmail message to extract sender, subject, body
 */
export function parseGmailMessage(raw: GmailMessage): ParsedEmail {
  const getHeader = (name: string): string => {
    const header = raw.payload.headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase(),
    );
    return header?.value || "";
  };

  const fromHeader = getHeader("From");
  // Parse "Name <email@example.com>" format
  const match = fromHeader.match(/^(.+?)\s*<(.+)>$/);

  return {
    sender: match ? match[2] : fromHeader,
    senderName: match ? match[1].trim().replace(/^"|"$/g, "") : undefined,
    subject: getHeader("Subject"),
    body: decodeMessageBody(raw),
    receivedAt: parseInt(raw.internalDate, 10),
  };
}

/**
 * Decode base64url message body from Gmail API
 */
function decodeMessageBody(message: GmailMessage): string {
  // Try to get plain text body first
  const payload = message.payload;

  // Simple message with body directly
  if (payload.body?.data) {
    return base64UrlDecode(payload.body.data);
  }

  // Multipart message - look for text/plain
  if (payload.parts) {
    const textPart = findPartByMimeType(payload.parts, "text/plain");
    if (textPart?.body?.data) {
      return base64UrlDecode(textPart.body.data);
    }

    // Fallback to text/html if no plain text
    const htmlPart = findPartByMimeType(payload.parts, "text/html");
    if (htmlPart?.body?.data) {
      return stripHtml(base64UrlDecode(htmlPart.body.data));
    }
  }

  // Use snippet as fallback
  return message.snippet || "";
}

/**
 * Find part by MIME type recursively
 */
function findPartByMimeType(
  parts: GmailMessage["payload"]["parts"],
  mimeType: string,
): GmailMessage["payload"] | undefined {
  if (!parts) return undefined;

  for (const part of parts) {
    if (part.mimeType === mimeType) {
      return part;
    }
    if (part.parts) {
      const found = findPartByMimeType(part.parts, mimeType);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Decode base64url string (Gmail uses URL-safe base64)
 */
function base64UrlDecode(data: string): string {
  // Replace URL-safe characters and pad
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  try {
    return atob(padded);
  } catch {
    return "";
  }
}

/**
 * Strip HTML tags for plain text matching
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Check if email matches a conversion rule
 */
export function matchesRule(
  email: ParsedEmail,
  rule: Doc<"emailConversionRules">,
): boolean {
  // At least one pattern must be defined
  const hasPattern =
    rule.senderPattern || rule.subjectPattern || rule.contentPattern;

  if (!hasPattern) return false;

  try {
    // Check sender pattern
    if (rule.senderPattern) {
      const regex = new RegExp(rule.senderPattern, "i");
      if (!regex.test(email.sender)) return false;
    }

    // Check subject pattern
    if (rule.subjectPattern) {
      const regex = new RegExp(rule.subjectPattern, "i");
      if (!regex.test(email.subject)) return false;
    }

    // Check content pattern
    if (rule.contentPattern) {
      const regex = new RegExp(rule.contentPattern, "i");
      if (!regex.test(email.body)) return false;
    }

    return true;
  } catch {
    // Invalid regex - treat as no match
    return false;
  }
}

/**
 * Merge tag IDs from multiple rules, removing duplicates
 */
export function mergeTagIds(rules: Doc<"emailConversionRules">[]): string[] {
  const tagSet = new Set<string>();
  for (const rule of rules) {
    for (const tagId of rule.autoTagIds) {
      tagSet.add(tagId);
    }
  }
  return Array.from(tagSet);
}

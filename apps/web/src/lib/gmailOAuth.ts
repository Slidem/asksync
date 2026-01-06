const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
].join(" ");

interface InitiateGmailOAuthParams {
  userId: string;
  orgId: string;
}

/**
 * Initiates Gmail OAuth flow by redirecting to Google's authorization page.
 * After authorization, Google redirects back to our Convex HTTP action callback.
 */
export function initiateGmailOAuth({
  userId,
  orgId,
}: InitiateGmailOAuthParams): void {
  // Encode state with user info for the callback
  const state = btoa(JSON.stringify({ userId, orgId }));

  const clientId = process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID;
  const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

  if (!clientId || !convexSiteUrl) {
    console.error("Missing Google OAuth environment variables");
    return;
  }

  const redirectUri = `${convexSiteUrl}/gmail/oauth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  window.location.href = `${GOOGLE_AUTH_URL}?${params}`;
}

/**
 * Check if Gmail OAuth is configured
 */
export function isGmailOAuthConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_GMAIL_CLIENT_ID &&
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL
  );
}

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
].join(" ");

interface InitiateGoogleOAuthParams {
  userId: string;
  orgId: string;
  visibility: "public" | "hidden";
}

/**
 * Initiates Google OAuth flow by redirecting to Google's authorization page.
 * After authorization, Google redirects back to our Convex HTTP action callback.
 */
export function initiateGoogleOAuth({
  userId,
  orgId,
  visibility,
}: InitiateGoogleOAuthParams): void {
  // Encode state with user info for the callback
  const state = btoa(JSON.stringify({ userId, orgId, visibility }));

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

  if (!clientId || !convexSiteUrl) {
    console.error("Missing Google OAuth environment variables");
    return;
  }

  const redirectUri = `${convexSiteUrl}/google-calendar/oauth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline", // Request refresh token
    prompt: "consent", // Always show consent screen to get refresh token
    state,
  });

  window.location.href = `${GOOGLE_AUTH_URL}?${params}`;
}

/**
 * Check if Google OAuth is configured
 */
export function isGoogleOAuthConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL
  );
}

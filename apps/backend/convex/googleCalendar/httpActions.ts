/* eslint-disable import/order */
import { GoogleTokenResponse, GoogleUserInfo } from "./types";

import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

/**
 * Webhook handler for Google Calendar push notifications
 */
export const handleWebhook = httpAction(async (ctx, request) => {
  // Get headers from Google
  const channelId = request.headers.get("X-Goog-Channel-ID");
  const resourceState = request.headers.get("X-Goog-Resource-State");
  const resourceId = request.headers.get("X-Goog-Resource-ID");

  if (!channelId || !resourceId) {
    return new Response("Missing headers", { status: 400 });
  }

  // "sync" is the initial verification - just acknowledge
  if (resourceState === "sync") {
    return new Response(null, { status: 200 });
  }

  // Find connection by webhook channel ID
  const connection = await ctx.runQuery(
    internal.googleCalendar.queries.getConnectionByWebhookChannel,
    { channelId },
  );

  if (!connection) {
    // Unknown channel - might be stale, just return 200 to stop retries
    return new Response(null, { status: 200 });
  }

  // Schedule incremental sync
  await ctx.scheduler.runAfter(
    0,
    internal.googleCalendar.sync.performIncrementalSync,
    { connectionId: connection._id },
  );

  return new Response(null, { status: 200 });
});

/**
 * OAuth callback handler - exchanges code for tokens
 */
export const handleOAuthCallback = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Get frontend URL for redirects
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  // Handle OAuth errors
  if (error) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${frontendUrl}/schedule?error=${encodeURIComponent(error)}`,
      },
    });
  }

  if (!code || !state) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${frontendUrl}/schedule?error=missing_params`,
      },
    });
  }

  // Parse state
  let stateData: {
    userId: string;
    orgId: string;
    visibility: "public" | "hidden";
  };
  try {
    stateData = JSON.parse(atob(state));
  } catch {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${frontendUrl}/schedule?error=invalid_state`,
      },
    });
  }

  // Exchange code for tokens
  const redirectUri = `${process.env.CONVEX_SITE_URL}/google-calendar/oauth/callback`;

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error("Token exchange failed:", errorText);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${frontendUrl}/schedule?error=token_exchange_failed`,
      },
    });
  }

  const tokens: GoogleTokenResponse = await tokenResponse.json();

  // Get user info from Google
  const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userInfoResponse.ok) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${frontendUrl}/schedule?error=userinfo_failed`,
      },
    });
  }

  const userInfo: GoogleUserInfo = await userInfoResponse.json();

  // Store connection
  await ctx.runMutation(internal.googleCalendar.mutations.storeConnection, {
    userId: stateData.userId,
    orgId: stateData.orgId,
    googleAccountId: userInfo.id,
    googleEmail: userInfo.email,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || "",
    tokenExpiresAt: Date.now() + tokens.expires_in * 1000,
    visibility: stateData.visibility,
  });

  // Redirect back to app with success
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${frontendUrl}/schedule?connected=google`,
    },
  });
});

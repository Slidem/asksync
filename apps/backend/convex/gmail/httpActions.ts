/* eslint-disable import/order */
import { GoogleTokenResponse, GoogleUserInfo } from "./types";

import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

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
        Location: `${frontendUrl}/emails?error=${encodeURIComponent(error)}`,
      },
    });
  }

  if (!code || !state) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${frontendUrl}/emails?error=missing_params`,
      },
    });
  }

  // Parse state
  let stateData: {
    userId: string;
    orgId: string;
  };
  try {
    stateData = JSON.parse(atob(state));
  } catch {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${frontendUrl}/emails?error=invalid_state`,
      },
    });
  }

  // Exchange code for tokens
  const redirectUri = `${process.env.CONVEX_SITE_URL}/gmail/oauth/callback`;

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID!,
      client_secret: process.env.GMAIL_CLIENT_SECRET!,
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
        Location: `${frontendUrl}/emails?error=token_exchange_failed`,
      },
    });
  }

  const tokens = (await tokenResponse.json()) as GoogleTokenResponse;

  // Get user info from Google
  const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userInfoResponse.ok) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${frontendUrl}/emails?error=userinfo_failed`,
      },
    });
  }

  const userInfo = (await userInfoResponse.json()) as GoogleUserInfo;

  // Store connection
  await ctx.runMutation(internal.gmail.mutations.storeConnection, {
    userId: stateData.userId,
    orgId: stateData.orgId,
    googleAccountId: userInfo.id,
    googleEmail: userInfo.email,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || "",
    tokenExpiresAt: Date.now() + tokens.expires_in * 1000,
  });

  // Redirect back to app with success
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${frontendUrl}/emails?connected=gmail`,
    },
  });
});

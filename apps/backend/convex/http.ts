/* eslint-disable import/order */
import {
  handleOAuthCallback,
  handleWebhook,
} from "./googleCalendar/httpActions";
import { handleOAuthCallback as handleGmailOAuthCallback } from "./gmail/httpActions";

import { httpRouter } from "convex/server";

const http = httpRouter();

// Google Calendar webhook endpoint - receives push notifications
http.route({
  path: "/google-calendar/webhook",
  method: "POST",
  handler: handleWebhook,
});

// OAuth callback - handles redirect from Google after user authorizes
http.route({
  path: "/google-calendar/oauth/callback",
  method: "GET",
  handler: handleOAuthCallback,
});

// Gmail OAuth callback
http.route({
  path: "/gmail/oauth/callback",
  method: "GET",
  handler: handleGmailOAuthCallback,
});

export default http;

/* eslint-disable import/order */
import {
  handleOAuthCallback,
  handleWebhook,
} from "./googleCalendar/httpActions";

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

export default http;

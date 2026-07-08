import { httpRouter } from "convex/server";

import { httpAction } from "./_generated/server";
import { receiveClerkUserWebhook } from "./userSync/clerk-user-webhook.controller";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(receiveClerkUserWebhook),
});

export default http;

import { PrivyClient } from "@privy-io/node";
import { env } from "@/lib/env.server";

let client: PrivyClient | null = null;

function privyAppId() {
  return env("PRIVY_APP_ID") ?? env("VITE_PRIVY_APP_ID");
}

export function privyConfigured() {
  return Boolean(privyAppId() && env("PRIVY_APP_SECRET"));
}

function getPrivy() {
  const appId = privyAppId();
  const appSecret = env("PRIVY_APP_SECRET");
  if (!appId || !appSecret) {
    throw new Error("Privy server credentials are not configured.");
  }
  if (!client) {
    client = new PrivyClient({ appId, appSecret });
  }
  return client;
}

export async function verifyPrivyUser(accessToken: string) {
  const privy = getPrivy();
  const claims = await privy.utils().auth().verifyAccessToken(accessToken);
  return claims.user_id;
}

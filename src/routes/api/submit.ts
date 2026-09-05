import { createFileRoute } from "@tanstack/react-router";
import { WALLET_RE } from "@/lib/config";
import { submitWalletToGoogleForm } from "@/lib/google-form.server";

export const Route = createFileRoute("/api/submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
        }

        const wallet =
          payload && typeof payload === "object" && "wallet" in payload
            ? String((payload as { wallet: unknown }).wallet).trim()
            : "";

        if (!WALLET_RE.test(wallet)) {
          return Response.json(
            { ok: false, error: "Enter a valid Base wallet address." },
            { status: 400 },
          );
        }

        try {
          await submitWalletToGoogleForm(wallet);
          return Response.json({ ok: true });
        } catch {
          return Response.json(
            { ok: false, error: "Unable to register wallet. Please try again." },
            { status: 502 },
          );
        }
      },
    },
  },
});

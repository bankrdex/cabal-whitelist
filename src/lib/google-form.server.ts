const FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSc2R5JAh10hIyIVIW9tYMKyH1Waaq8Wn0uNtIQsleNVi5HWrw/formResponse";
const ENTRY_ID = "entry.390348906";

export async function submitWalletToGoogleForm(wallet: string): Promise<void> {
  const body = new URLSearchParams({ [ENTRY_ID]: wallet });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(FORM_ACTION, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      signal: controller.signal,
      redirect: "follow",
    });

    const text = await res.text().catch(() => "");
    const recorded = text.toLowerCase().includes("your response has been recorded");

    if (!res.ok && !recorded) {
      throw new Error("Whitelist registration failed. Try again.");
    }
  } finally {
    clearTimeout(timer);
  }
}

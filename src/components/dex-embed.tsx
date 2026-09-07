import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOKEN } from "@/lib/config";

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
  }
}

export function DexEmbed() {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === "#chart") {
        setOpen(true);
        window.requestAnimationFrame(() => {
          document.getElementById("chart")?.scrollIntoView({ block: "start" });
        });
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  async function onCopy() {
    await copyText(TOKEN.address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section id="chart" className="flex scroll-mt-6 flex-col gap-3">
      <div
        className="stagger-in rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
        style={{ animationDelay: "160ms" }}
      >
        <p className="text-xs font-medium tracking-wide text-muted">Live on Base</p>
        <h2 className="font-display mt-1 text-2xl font-semibold tracking-wide text-fg">
          Chart & chat
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Official {TOKEN.symbol} contract. Load the DexScreener below for the live chart
          and holder chat.
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-surface-2 py-2 pr-2 pl-3 shadow-[var(--shadow-border)]">
          <code className="min-w-0 flex-1 truncate font-mono text-xs text-fg">{TOKEN.address}</code>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md bg-surface px-3 text-sm font-medium text-fg shadow-[var(--shadow-border)] transition-[box-shadow,background-color] duration-150 hover:shadow-[var(--shadow-border-hover)]"
            aria-label={copied ? "Contract copied" : "Copy contract address"}
          >
            {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button asChild variant="outline" size="full">
            <a href={TOKEN.dexscreenerUrl} target="_blank" rel="noreferrer">
              DexScreener
              <ExternalLink />
            </a>
          </Button>
          <Button asChild variant="outline" size="full">
            <a href={TOKEN.basescanUrl} target="_blank" rel="noreferrer">
              BaseScan
              <ExternalLink />
            </a>
          </Button>
        </div>
      </div>

      <div
        className="stagger-in overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]"
        style={{ animationDelay: "200ms" }}
      >
        {open ? (
          <iframe
            title={`${TOKEN.symbol} DexScreener chart and chat`}
            src={TOKEN.embedUrl}
            className="block h-[36rem] w-full bg-surface sm:h-[42rem]"
            allow="clipboard-write"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-lg bg-surface-2 text-primary shadow-[var(--shadow-border)]">
              <MessageCircle className="size-5" />
            </div>
            <p className="font-display text-lg font-semibold tracking-wide text-fg">
              DexScreener chart & chat
            </p>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              Live candle chart, trades, and the holder chat tab.
            </p>
            <Button type="button" size="lg" onClick={() => setOpen(true)}>
              Load chart & chat
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

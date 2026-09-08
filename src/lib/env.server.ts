export function env(key: string): string | undefined {
  const fromProcess = process.env[key]?.trim();
  if (fromProcess) return fromProcess;
  try {
    const netlifyEnv = (
      globalThis as {
        Netlify?: { env?: { get?: (name: string) => string | undefined } };
      }
    ).Netlify?.env;
    const fromNetlify = netlifyEnv?.get?.(key)?.trim();
    return fromNetlify || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Workspace preview vs deployed app. The deployer writes GROK_PROJECT_ID on
 * every publish; the sandbox preview never has it. Single source of truth for
 * the split — gate audience, gate endpoints and connector-token semantics all
 * key off this predicate.
 */
export function isWorkspacePreview(): boolean {
  return !env("GROK_PROJECT_ID");
}

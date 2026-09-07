import { createContext, lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { PRIVY } from "@/lib/config";

const PrivyTree = lazy(() => import("@/components/privy-tree"));

export const PrivyEnabledContext = createContext(false);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fallback = (
    <PrivyEnabledContext.Provider value={false}>{children}</PrivyEnabledContext.Provider>
  );

  if (!mounted || !PRIVY.appId) return fallback;

  return (
    <Suspense fallback={fallback}>
      <PrivyTree>{children}</PrivyTree>
    </Suspense>
  );
}

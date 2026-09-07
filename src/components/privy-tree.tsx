import { type ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { base } from "viem/chains";
import { PrivyEnabledContext } from "@/components/wallet-provider";
import { PRIVY, SITE } from "@/lib/config";

export default function PrivyTree({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY.appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#3DDCFF",
          logo: "/cabal-avatar.jpg",
          landingHeader: `Claim ${SITE.token}`,
          loginMessage: "Log in with email or X. No MetaMask needed.",
          showWalletLoginFirst: false,
          walletChainType: "ethereum-only",
        },
        loginMethods: ["email", "twitter"],
        defaultChain: base,
        supportedChains: [base],
        embeddedWallets: {
          ethereum: { createOnLogin: "all-users" },
        },
      }}
    >
      <PrivyEnabledContext.Provider value={true}>{children}</PrivyEnabledContext.Provider>
    </PrivyProvider>
  );
}

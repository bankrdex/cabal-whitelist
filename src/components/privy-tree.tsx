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
          loginMessage: "Connect the Base wallet you submitted.",
          showWalletLoginFirst: true,
          walletChainType: "ethereum-only",
          walletList: [
            "detected_ethereum_wallets",
            "metamask",
            "coinbase_wallet",
            "base_account",
            "rainbow",
            "wallet_connect",
          ],
        },
        loginMethods: ["wallet"],
        defaultChain: base,
        supportedChains: [base],
        embeddedWallets: {
          ethereum: { createOnLogin: "off" },
        },
      }}
    >
      <PrivyEnabledContext.Provider value={true}>{children}</PrivyEnabledContext.Provider>
    </PrivyProvider>
  );
}

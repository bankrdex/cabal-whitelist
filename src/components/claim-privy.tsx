import { usePrivy } from "@privy-io/react-auth";
import { ClaimFrame } from "@/components/claim-panel";

export default function ClaimWithPrivy() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const address = user?.wallet?.address ?? null;

  return (
    <ClaimFrame
      address={authenticated ? address : null}
      onConnect={ready ? () => login({ loginMethods: ["wallet"] }) : null}
      onLogout={authenticated ? () => logout() : null}
    />
  );
}

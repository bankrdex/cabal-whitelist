import { createFileRoute } from "@tanstack/react-router";
import { WhitelistApp } from "@/components/whitelist-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <WhitelistApp />;
}

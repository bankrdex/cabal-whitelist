import { createFileRoute } from "@tanstack/react-router";
import { ClaimApp } from "@/components/claim-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <ClaimApp />;
}

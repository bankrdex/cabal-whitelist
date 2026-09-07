import { createFileRoute } from "@tanstack/react-router";
import { AdminApp } from "@/components/admin-app";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <AdminApp />
    </div>
  );
}

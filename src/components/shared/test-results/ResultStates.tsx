import { Loader2 } from "lucide-react";
import Link from "next/link";
import { InfoCard } from "@/components/shared/data/InfoCard";
import { Button } from "@/components/shared/ui/Button";

export function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <InfoCard
        title="Loading Result"
        variant="admin"
        icon={<Loader2 className="animate-spin text-3xl text-tathir-dark-green" />}
        description="Please wait while we load your test result..."
      />
    </div>
  );
}

export function ErrorState({ error, backLink }: { error: string; backLink: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <InfoCard
        title="Error Loading Result"
        variant="admin"
        description={error}
        actions={{
          primary: {
            label: "Go Back",
            onClick: () => window.location.href = backLink
          }
        }}
      />
    </div>
  );
}

export function NotFoundState({ backLink }: { backLink: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <InfoCard
        title="Result Not Found"
        variant="admin"
        description="The test result you're looking for doesn't exist."
        actions={{
          primary: {
            label: "Go Back",
            onClick: () => window.location.href = backLink
          }
        }}
      />
    </div>
  );
} 
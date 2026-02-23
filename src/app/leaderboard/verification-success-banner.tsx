"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/motion";

export function VerificationSuccessBanner({
  githubUsername,
}: {
  githubUsername?: string;
}) {
  const router = useRouter();

  // Remove ?verified=1 from URL after showing so refreshing doesn't re-show the banner
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/leaderboard", { scroll: false });
    }, 8000);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <FadeIn>
      <div className="rounded-xl border border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/40 px-4 py-3 flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
        <div className="min-w-0">
          <p className="font-medium text-green-800 dark:text-green-200">
            You&apos;re verified and on the board
          </p>
          <p className="text-sm text-green-700 dark:text-green-300/90">
            {githubUsername
              ? `Your GitHub stats for @${githubUsername} are now live. Find your ranking below.`
              : "Your GitHub data is synced. Find your ranking below."}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}

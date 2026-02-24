import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Award, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";

export const metadata: Metadata = {
  title: "About",
  description: "About UW GitRank — verify your @uwaterloo.ca email to join the rankings.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f2f2f2] text-zinc-900 p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-12 py-12">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/leaderboard"
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Rankings
          </Link>
          <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center">
            <Github className="w-5 h-5 text-[#EAB308]" />
          </div>
        </div>

        {/* Verification CTA */}
        <FadeIn viewOnce className="bg-zinc-900 text-white p-8 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center gap-3 text-[#EAB308]">
            <Award className="w-6 h-6" />
            <h3 className="text-xl font-bold">Get on the Board</h3>
          </div>
          <p className="text-zinc-300">
            Already signed in with GitHub? Link your{" "}
            <strong>@uwaterloo.ca</strong> email to join the official rankings.
            Verification takes less than a minute.
          </p>
          <Button
            asChild
            className="bg-[#EAB308] text-black hover:bg-[#D9A307] font-bold"
          >
            <Link href="/verify">Verify &amp; Join Rankings</Link>
          </Button>
        </FadeIn>

        {/* Footer */}
        <footer className="text-center pt-4">
          <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
            © UW GitRank 2026
          </p>
        </footer>
      </div>
    </div>
  );
}

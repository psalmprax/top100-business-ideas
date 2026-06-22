/**
 * Workforce Page — Stub placeholder
 * Original section components were removed during dead-code cleanup.
 */

import { Link } from "wouter";
import { Building2, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkforcePage() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 font-sans">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-white"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Alpha Hub
              </Button>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">
                Alpha <span className="text-indigo-400">Workforce</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 p-8 animate-in fade-in duration-500">
        <div className="p-6 rounded-3xl bg-muted/20 border border-border/30">
          <RefreshCw className="w-16 h-16 text-indigo-500/30 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">
            Workforce — Under Rebuild
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            The autonomous Workforce management dashboard is being rebuilt with
            a new modular architecture. Boardroom, CEO, Growth, Ops, Finance,
            and HR modules will return shortly.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">Return to Hub</Link>
        </Button>
      </main>
    </div>
  );
}

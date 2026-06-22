/**
 * Compliance Hub — Stub placeholder
 * Original section components were removed during dead-code cleanup.
 */

import { Link } from "wouter";
import { Scale, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComplianceHub() {
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">
                Compliance<span className="text-emerald-400">Hub</span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 p-8 animate-in fade-in duration-500">
        <div className="p-6 rounded-3xl bg-muted/20 border border-border/30">
          <RefreshCw className="w-16 h-16 text-emerald-500/30 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">
            Compliance Hub — Under Rebuild
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            The AI Compliance dashboard is being rebuilt with a new modular
            architecture. Regulatory tracking, model governance, and audit
            features will return shortly.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">Return to Hub</Link>
        </Button>
      </main>
    </div>
  );
}

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HiringSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>First 5 Hires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="font-medium">ML / CV Engineer</span>
              <span className="text-xs text-muted-foreground">Month 1</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="font-medium">Backend (Go/Crypto)</span>
              <span className="text-xs text-muted-foreground">Month 2</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="font-medium">Enterprise Sales Lead</span>
              <span className="text-xs text-muted-foreground">Month 3</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="font-medium">Security Engineer</span>
              <span className="text-xs text-muted-foreground">Month 4</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="font-medium">Customer Success</span>
              <span className="text-xs text-muted-foreground">Month 5</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Compensation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ML Engineer</span>
              <span className="font-mono text-sm">$180K - $220K</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Backend Engineer</span>
              <span className="font-mono text-sm">$160K - $200K</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sales Lead</span>
              <span className="font-mono text-sm">$150K + Commission</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Security Engineer</span>
              <span className="font-mono text-sm">$170K - $210K</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Equity Pool</span>
              <span className="font-mono text-sm">10% over 4 years</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

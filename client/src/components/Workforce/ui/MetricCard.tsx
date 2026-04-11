import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  footer?: string;
  color?: string;
}

export const MetricCard = ({
  title,
  value,
  icon: Icon,
  footer,
  color = "",
}: MetricCardProps) => (
  <Card className="border-primary/5 hover:border-primary/20 transition-all shadow-lg group bg-card/50 backdrop-blur-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">
            {title}
          </h3>
          <div className="text-3xl font-black tracking-tighter text-white">{value}</div>
        </div>
        <div
          className={`p-3 rounded-2xl ${color || "bg-muted/50"} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner border border-white/5`}
        >
          <Icon className="w-8 h-8 text-primary/80" />
        </div>
      </div>
      {footer && (
        <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse" />
          <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground/40">
            {footer}
          </span>
        </div>
      )}
    </CardContent>
  </Card>
);

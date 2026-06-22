/**
 * Shared UI components for the Deepfake Defense system.
 * Extracted from AlphaHectaDeepfakeDefense.tsx to reduce component size.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ThreatAlert } from "../types";

export function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  change,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change?: number;
}) {
  return (
    <Card className="overflow-hidden group hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className={`p-2 rounded-lg ${color}`}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
          {change !== undefined && (
            <Badge
              className={
                change >= 0
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-red-500/10 text-red-500 border-red-500/20"
              }
            >
              {change >= 0 ? "+" : ""}
              {change}%
            </Badge>
          )}
        </div>
        <div className="mt-3">
          <div className="text-stat text-white tabular-nums mb-1">{value}</div>
          <div className="text-stat-label mt-0.5">{title}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MediaTypeCard({
  type,
  count,
  icon: Icon,
  color,
}: {
  type: string;
  count: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-stat text-white tabular-nums">{count}</span>
        </div>
        <p className="text-feature mt-2 capitalize">{type}s analyzed</p>
      </CardContent>
    </Card>
  );
}

export function ThreatBadge({
  severity,
}: {
  severity: ThreatAlert["severity"];
}) {
  const config = {
    critical: { color: "bg-red-500", label: "Critical" },
    high: { color: "bg-orange-500", label: "High" },
    medium: { color: "bg-yellow-500", label: "Medium" },
    low: { color: "bg-blue-500", label: "Low" },
  };
  const c = config[severity];
  return <Badge className={`${c.color} text-white`}>{c.label}</Badge>;
}

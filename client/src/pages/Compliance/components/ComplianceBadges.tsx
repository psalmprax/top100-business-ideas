import { Badge } from "@/components/ui/badge";
import { type AIModel } from "../types";

export function RiskBadge({ category }: { category?: string }) {
  const config: Record<string, { color: string; label: string }> = {
    unacceptable: { color: "bg-red-500", label: "Unacceptable" },
    high: { color: "bg-orange-500", label: "High Risk" },
    limited: { color: "bg-yellow-500", label: "Limited Risk" },
    minimal: { color: "bg-green-500", label: "Minimal Risk" },
    critical: { color: "bg-red-600", label: "Critical" },
    medium: { color: "bg-yellow-600", label: "Medium Risk" },
    low: { color: "bg-green-600", label: "Low Risk" },
  };
  const c = category && config[category.toLowerCase()]
    ? config[category.toLowerCase()]
    : { color: "bg-zinc-500", label: "Unknown" };
  return <Badge className={`${c.color} text-white whitespace-nowrap`}>{c.label}</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    compliant: { color: "bg-green-500", label: "Compliant" },
    non_compliant: { color: "bg-red-500", label: "Non-Compliant" },
    pending: { color: "bg-yellow-500", label: "Pending" },
    review: { color: "bg-blue-500", label: "Under Review" },
  };
  const c = config[status] || config.pending;
  return <Badge className={`${c.color} text-white`}>{c.label}</Badge>;
}

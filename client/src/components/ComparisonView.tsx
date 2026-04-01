/**
 * Comparison View Component
 * Displays 2-3 selected ideas side-by-side with all key metrics
 * Design: Dark theme with color-coded metrics for easy scanning
 */

import { type BusinessIdea, CATEGORY_COLORS, TREND_COLORS } from "@/lib/api";
import { X, TrendingUp, DollarSign, Clock, Zap, BarChart2, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ComparisonViewProps {
  ideas: BusinessIdea[];
  onClose: () => void;
}

function MetricCell({ label, value, color, unit = "" }: { label: string; value: string | number; color?: string; unit?: string }) {
  return (
    <div className="p-3 rounded-lg" style={{ background: "oklch(0.15 0.02 265)" }}>
      <div className="text-xs text-white/40 mb-1">{label}</div>
      <div className="text-sm font-bold" style={{ color: color || "white" }}>
        {value}{unit}
      </div>
    </div>
  );
}

export function ComparisonView({ ideas, onClose }: ComparisonViewProps) {
  if (ideas.length === 0) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" style={{ background: "oklch(0.10 0.02 265)", border: "1px solid oklch(0.25 0.04 265)" }}>
        <DialogHeader>
          <DialogTitle className="text-white text-2xl" style={{ fontFamily: "'Syne', sans-serif" }}>
            Comparison: {ideas.length} Ideas
          </DialogTitle>
        </DialogHeader>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid oklch(0.22 0.02 265)" }}>
                <th className="text-left p-3 text-white/50 font-semibold text-xs uppercase">Metric</th>
                {ideas.map(idea => (
                  <th key={idea.id} className="text-left p-3 text-white font-bold" style={{ minWidth: "200px" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold" style={{ backgroundColor: CATEGORY_COLORS[idea.category] + "22", color: CATEGORY_COLORS[idea.category] }}>
                        #{idea.rank}
                      </span>
                    </div>
                    <div className="text-sm leading-tight">{idea.title}</div>
                    <span className="text-xs px-2 py-0.5 rounded-md mt-1 inline-block" style={{ backgroundColor: CATEGORY_COLORS[idea.category] + "18", color: CATEGORY_COLORS[idea.category] }}>
                      {idea.category}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Earning Potential */}
              <tr style={{ borderBottom: "1px solid oklch(0.15 0.02 265)" }}>
                <td className="p-3 text-white/50 font-semibold text-xs flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Earning Potential
                </td>
                {ideas.map(idea => (
                  <td key={idea.id} className="p-3">
                    <div className="text-amber-400 font-bold">{idea.earning_label}</div>
                    <div className="text-xs text-white/40">${idea.earning_potential.toLocaleString()}/yr</div>
                  </td>
                ))}
              </tr>

              {/* Rollout Speed */}
              <tr style={{ borderBottom: "1px solid oklch(0.15 0.02 265)" }}>
                <td className="p-3 text-white/50 font-semibold text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Rollout Speed
                </td>
                {ideas.map(idea => {
                  const speedColor = idea.rollout_speed >= 9 ? "#22c55e" : idea.rollout_speed >= 7 ? "#3b82f6" : "#f59e0b";
                  return (
                    <td key={idea.id} className="p-3">
                      <div style={{ color: speedColor }} className="font-bold">
                        {idea.rollout_label}
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${idea.rollout_speed * 10}%`, backgroundColor: speedColor }}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Profit Margin */}
              <tr style={{ borderBottom: "1px solid oklch(0.15 0.02 265)" }}>
                <td className="p-3 text-white/50 font-semibold text-xs flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Profit Margin
                </td>
                {ideas.map(idea => (
                  <td key={idea.id} className="p-3">
                    <div className="text-emerald-400 font-bold">{idea.profit_margin}%</div>
                    <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${idea.profit_margin}%`, backgroundColor: "#10b981" }}
                      />
                    </div>
                  </td>
                ))}
              </tr>

              {/* Market Size */}
              <tr style={{ borderBottom: "1px solid oklch(0.15 0.02 265)" }}>
                <td className="p-3 text-white/50 font-semibold text-xs flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" /> Market Size
                </td>
                {ideas.map(idea => (
                  <td key={idea.id} className="p-3">
                    <div className="text-blue-400 font-bold">${idea.market_size_bn}B</div>
                    <div className="text-xs text-white/40">Global addressable</div>
                  </td>
                ))}
              </tr>

              {/* Startup Cost */}
              <tr style={{ borderBottom: "1px solid oklch(0.15 0.02 265)" }}>
                <td className="p-3 text-white/50 font-semibold text-xs flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Startup Cost
                </td>
                {ideas.map(idea => (
                  <td key={idea.id} className="p-3">
                    <div className="text-orange-400 font-bold">{idea.startup_cost}</div>
                  </td>
                ))}
              </tr>

              {/* Trend */}
              <tr style={{ borderBottom: "1px solid oklch(0.15 0.02 265)" }}>
                <td className="p-3 text-white/50 font-semibold text-xs flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Growth Trend
                </td>
                {ideas.map(idea => {
                  const trendColor = TREND_COLORS[idea.trend];
                  return (
                    <td key={idea.id} className="p-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: trendColor + "22", color: trendColor, border: `1px solid ${trendColor}44` }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: trendColor }} />
                        {idea.trend}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Markets */}
              <tr style={{ borderBottom: "1px solid oklch(0.15 0.02 265)" }}>
                <td className="p-3 text-white/50 font-semibold text-xs flex items-center gap-2">
                  <Target className="w-4 h-4" /> Markets
                </td>
                {ideas.map(idea => (
                  <td key={idea.id} className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {idea.markets.map(m => (
                        <span key={m} className="text-xs px-1.5 py-0.5 rounded bg-white/8 text-white/60">
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Gap Analysis */}
              <tr>
                <td className="p-3 text-white/50 font-semibold text-xs align-top">Gap Analysis</td>
                {ideas.map(idea => (
                  <td key={idea.id} className="p-3">
                    <p className="text-xs text-white/60 leading-relaxed">{idea.gap}</p>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Scores */}
        <div className="mt-6 pt-6 border-t border-white/8">
          <h3 className="text-sm font-bold text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            Quick Score Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ideas.map(idea => {
              const overallScore = Math.round(
                (idea.earning_potential / 10000000) * 20 +
                (idea.rollout_speed / 10) * 20 +
                (idea.profit_margin / 100) * 20 +
                (idea.market_size_bn / 500) * 20 +
                (idea.trend === "Explosive" ? 20 : idea.trend === "High Growth" ? 10 : 5)
              );
              return (
                <div key={idea.id} className="p-4 rounded-lg" style={{ background: "oklch(0.15 0.02 265)", border: "1px solid oklch(0.22 0.02 265)" }}>
                  <div className="text-xs text-white/50 mb-2">{idea.title}</div>
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {overallScore}
                    </div>
                    <div className="text-xs text-white/40 mb-1">/100</div>
                  </div>
                  <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${overallScore}%`,
                        background: overallScore >= 75 ? "#22c55e" : overallScore >= 50 ? "#3b82f6" : "#f59e0b"
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Design: Venture Capital Intelligence Hub
 * Dark-mode data intelligence — Palantir meets Stripe Dashboard
 * Typography: Syne (display) + Outfit (body)
 * Colors: Near-black bg, electric blue/green/amber accents
 * Layout: Fixed nav, hero with counters, filter bar, card grid, charts panel
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  businessIdeas as mockIdeas,
  CATEGORY_COLORS,
  TREND_COLORS,
  ALL_CATEGORIES,
  ALL_MARKETS,
  ALL_TRENDS,
} from "@/lib/businessData";
import { ventureApi, type BusinessIdea } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search,
  TrendingUp,
  DollarSign,
  Zap,
  Globe,
  BarChart2,
  Filter,
  X,
  ChevronDown,
  ExternalLink,
  Target,
  Clock,
  PieChartIcon,
  Activity,
  Bookmark,
  BookmarkCheck,
  Download,
  Columns3,
} from "lucide-react";
import { useShortlist } from "@/hooks/useShortlist";
import { ComparisonView } from "@/components/ComparisonView";
import { IdeaDetailEnhanced } from "@/components/IdeaDetailEnhanced";
import {
  exportToCSV,
  exportToPDF,
  exportShortlistToPDF,
} from "@/lib/exportUtils";

const HERO_BG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663416294596/Z5RySCNbJcUs3jbtGjPeMT/hero-bg-ad6ZRYLG9KdpGvzmjGjnUz.webp";

// Bookmark icon component
function BookmarkButton({
  isBookmarked,
  onClick,
}: {
  isBookmarked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-lg transition-all hover:scale-110"
      style={{
        background: isBookmarked
          ? "oklch(0.22 0.18 145 / 0.3)"
          : "oklch(0.16 0.02 265)",
        color: isBookmarked ? "#22c55e" : "rgba(255,255,255,0.5)",
        border: isBookmarked
          ? "1px solid oklch(0.22 0.18 145 / 0.5)"
          : "1px solid oklch(0.22 0.02 265)",
      }}
      title={isBookmarked ? "Remove from shortlist" : "Add to shortlist"}
    >
      {isBookmarked ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
    </button>
  );
}

// Animated counter hook
function useCountUp(target: number, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCounter({
  value,
  label,
  prefix = "",
  suffix = "",
}: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(value, 1800, visible);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <div className="text-stat text-white mb-1 tabular-nums">
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-stat-label">{label}</div>
    </div>
  );
}

function TrendBadge({ trend }: { trend: BusinessIdea["trend"] }) {
  const color = TREND_COLORS[trend];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: color + "22",
        color,
        border: `1px solid ${color}44`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full pulse-glow"
        style={{ backgroundColor: color }}
      />
      {trend}
    </span>
  );
}

function SpeedBar({ value, label }: { value: number; label: string }) {
  const color = value >= 9 ? "#22c55e" : value >= 7 ? "#3b82f6" : "#f59e0b";
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-white/50">Rollout Speed</span>
        <span className="text-xs font-semibold" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value * 10}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function EarningBar({ value }: { value: number }) {
  const max = 10000000;
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-white/50">Earning Potential</span>
        <span className="text-xs font-semibold text-amber-400">
          {pct >= 50 ? "Very High" : pct >= 25 ? "High" : "Medium"}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #f59e0b, #ef4444)",
          }}
        />
      </div>
    </div>
  );
}

function IdeaCard({
  idea,
  index,
  onClick,
  onBookmark,
  isBookmarked,
  onCompare,
  isInComparison,
}: {
  idea: BusinessIdea;
  index: number;
  onClick: () => void;
  onBookmark: () => void;
  isBookmarked: boolean;
  onCompare: () => void;
  isInComparison: boolean;
}) {
  const catColor = CATEGORY_COLORS[idea.category] || "#6366f1";
  return (
    <div
      className="idea-card rounded-xl p-5 cursor-pointer relative overflow-hidden"
      style={{
        background: "oklch(0.12 0.02 265)",
        border: "1px solid oklch(0.22 0.02 265)",
        animationDelay: `${(index % 12) * 50}ms`,
        animation: "card-enter 0.4s ease-out forwards",
        opacity: 0,
      }}
      onClick={onClick}
    >
      {/* Rank badge */}
      <div
        className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black tabular-nums"
        style={{
          backgroundColor: catColor + "22",
          color: catColor,
          border: `1px solid ${catColor}44`,
        }}
      >
        #{idea.rank}
      </div>

      {/* Category chip */}
      <div className="mb-3">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-md"
          style={{ backgroundColor: catColor + "18", color: catColor }}
        >
          {idea.category}
        </span>
      </div>

      <h3 className="text-card-title text-white mb-2 pr-10">{idea.title}</h3>

      <p className="text-body-sm mb-4 line-clamp-2">{idea.description}</p>

      {/* Metrics */}
      <div className="space-y-2.5 mb-4">
        <SpeedBar value={idea.rollout_speed} label={idea.rollout_label} />
        <EarningBar value={idea.earning_potential} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <TrendBadge trend={idea.trend} />
        <div className="flex gap-1">
          {idea.markets.slice(0, 3).map(m => (
            <span
              key={m}
              className="text-xs px-1.5 py-0.5 rounded bg-white/8 text-white/40"
            >
              {m}
            </span>
          ))}
          {idea.markets.length > 3 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-white/8 text-white/40">
              +{idea.markets.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Profit margin indicator */}
      <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between">
        <span className="text-overline opacity-50">Profit Margin</span>
        <span className="text-body-sm font-bold text-emerald-400 tabular-nums">
          {idea.profit_margin}%
        </span>
      </div>

      {/* Action buttons */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={e => {
            e.stopPropagation();
            onBookmark();
          }}
          className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all"
          data-testid={`bookmark-btn-${idea.id}`}
          style={{
            background: isBookmarked
              ? "oklch(0.22 0.18 145 / 0.3)"
              : "oklch(0.16 0.02 265)",
            color: isBookmarked ? "#22c55e" : "rgba(255,255,255,0.5)",
            border: isBookmarked
              ? "1px solid oklch(0.22 0.18 145 / 0.5)"
              : "1px solid oklch(0.22 0.02 265)",
          }}
        >
          {isBookmarked ? "✓ Saved" : "Save"}
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            onCompare();
          }}
          className="flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all"
          data-testid={`compare-btn-${idea.id}`}
          style={{
            background: isInComparison
              ? "oklch(0.65 0.2 250 / 0.3)"
              : "oklch(0.16 0.02 265)",
            color: isInComparison ? "#3b82f6" : "rgba(255,255,255,0.5)",
            border: isInComparison
              ? "1px solid oklch(0.65 0.2 250 / 0.5)"
              : "1px solid oklch(0.22 0.02 265)",
          }}
        >
          {isInComparison ? "✓ Compare" : "Compare"}
        </button>
      </div>
    </div>
  );
}

function IdeaModal({
  idea,
  onClose,
}: {
  idea: BusinessIdea;
  onClose: () => void;
}) {
  const catColor = CATEGORY_COLORS[idea.category] || "#6366f1";
  const trendColor = TREND_COLORS[idea.trend];

  const radarData = [
    {
      subject: "Earning",
      value: Math.min((idea.earning_potential / 10000000) * 100, 100),
    },
    { subject: "Speed", value: idea.rollout_speed * 10 },
    { subject: "Margin", value: idea.profit_margin },
    {
      subject: "Market",
      value: Math.min((idea.market_size_bn / 500) * 100, 100),
    },
    { subject: "Scalability", value: idea.scalability_score || 0 }, // Using real metric from backend
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          background: "oklch(0.10 0.02 265)",
          border: "1px solid oklch(0.25 0.04 265)",
        }}
      >
        <DialogHeader>
          <div className="flex items-start gap-3 mb-2">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold font-display tracking-tight flex-shrink-0"
              style={{
                backgroundColor: catColor + "22",
                color: catColor,
                border: `1px solid ${catColor}44`,
              }}
            >
              #{idea.rank}
            </div>
            <div>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-md mb-1 inline-block"
                style={{ backgroundColor: catColor + "18", color: catColor }}
              >
                {idea.category}
              </span>
              <DialogTitle className="text-white text-xl leading-tight font-display tracking-tight">
                {idea.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Description */}
          <div
            className="p-4 rounded-xl"
            style={{ background: "oklch(0.14 0.02 265)" }}
          >
            <p className="text-body leading-relaxed">{idea.description}</p>
          </div>

          {/* Gap Analysis */}
          <div
            className="p-4 rounded-xl border"
            style={{
              background: "oklch(0.12 0.025 265)",
              borderColor: trendColor + "33",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4" style={{ color: trendColor }} />
              <span className="text-card-title text-white">Gap Analysis</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{idea.gap}</p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: <DollarSign className="w-4 h-4" />,
                label: "Earning Potential",
                value: idea.earning_label,
                color: "#f59e0b",
              },
              {
                icon: <Clock className="w-4 h-4" />,
                label: "Rollout Speed",
                value: idea.rollout_label,
                color: "#22c55e",
              },
              {
                icon: <TrendingUp className="w-4 h-4" />,
                label: "Profit Margin",
                value: `${idea.profit_margin}%`,
                color: "#3b82f6",
              },
              {
                icon: <BarChart2 className="w-4 h-4" />,
                label: "Market Size",
                value: `$${idea.market_size_bn}B`,
                color: "#a78bfa",
              },
              {
                icon: <Zap className="w-4 h-4" />,
                label: "Startup Cost",
                value: idea.startup_cost,
                color: "#fb923c",
              },
              {
                icon: <Activity className="w-4 h-4" />,
                label: "Trend",
                value: idea.trend,
                color: trendColor,
              },
            ].map(({ icon, label, value, color }) => (
              <div
                key={label}
                className="p-3 rounded-lg"
                style={{ background: "oklch(0.15 0.02 265)" }}
              >
                <div
                  className="flex items-center gap-1.5 mb-1"
                  style={{ color }}
                >
                  {icon}
                  <span className="text-xs text-white/50">{label}</span>
                </div>
                <div className="text-sm font-bold text-white">{value}</div>
              </div>
            ))}
          </div>

          {/* Radar Chart */}
          <div>
            <h4 className="text-caption-premium text-white/70 mb-3">
              Opportunity Score
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke={catColor}
                  fill={catColor}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Markets & Tags */}
          <div className="flex flex-wrap gap-2">
            {idea.markets.map(m => (
              <span
                key={m}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                style={{ background: "oklch(0.18 0.03 250)", color: "#60a5fa" }}
              >
                <Globe className="w-3 h-3" />
                {m}
              </span>
            ))}
            {idea.tags.map(t => (
              <span
                key={t}
                className="text-xs px-2 py-1 rounded-full text-white/50"
                style={{ background: "oklch(0.16 0.02 265)" }}
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Charts Section
function ChartsSection({ ideas }: { ideas: BusinessIdea[] }) {
  // Category distribution
  const catData = useMemo(() => {
    const counts: Record<string, number> = {};
    ideas.forEach(i => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({
        name: name.replace(" & ", " & ").replace("Technology", "Tech"),
        value,
        color: CATEGORY_COLORS[name] || "#6366f1",
      }));
  }, [ideas]);

  // Trend distribution
  const trendData = useMemo(() => {
    const counts: Record<string, number> = {};
    ideas.forEach(i => {
      counts[i.trend] = (counts[i.trend] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: TREND_COLORS[name],
    }));
  }, [ideas]);

  // Top 10 by earning potential
  const top10Earning = useMemo(
    () =>
      [...ideas]
        .sort((a, b) => b.earning_potential - a.earning_potential)
        .slice(0, 10)
        .map(i => ({
          name:
            i.title.split(":")[0].substring(0, 22) +
            (i.title.length > 22 ? "…" : ""),
          value: i.earning_potential / 1000000,
          color: CATEGORY_COLORS[i.category] || "#6366f1",
        })),
    [ideas]
  );

  // Startup cost vs profit margin scatter
  const scatterData = useMemo(() => {
    const costMap: Record<string, number> = {
      "Very Low ($1K–$5K)": 3,
      "Very Low ($2K–$10K)": 6,
      "Very Low ($2K–$15K)": 8,
      "Low ($5K–$20K)": 12,
      "Low ($5K–$25K)": 15,
      "Low ($5K–$30K)": 17,
      "Low ($10K–$40K)": 25,
      "Low ($10K–$50K)": 30,
      "Low ($10K–$60K)": 35,
      "Low ($15K–$60K)": 37,
      "Low ($15K–$70K)": 42,
      "Low ($15K–$80K)": 47,
      "Medium ($20K–$100K)": 60,
      "Medium ($25K–$120K)": 72,
      "Medium ($30K–$150K)": 90,
      "Medium ($40K–$200K)": 120,
      "Medium ($50K–$250K)": 150,
      "High ($100K–$400K)": 250,
      "High ($100K–$500K)": 300,
      "High ($200K–$1M)": 600,
    };
    return ideas.map(i => ({
      x: costMap[i.startup_cost] || 50,
      y: i.profit_margin,
      z: i.rollout_speed,
      name: i.title,
      color: CATEGORY_COLORS[i.category] || "#6366f1",
    }));
  }, [ideas]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div
          className="rounded-lg p-3 text-xs"
          style={{
            background: "oklch(0.15 0.03 265)",
            border: "1px solid oklch(0.25 0.04 265)",
          }}
        >
          <p className="text-white font-semibold mb-1">
            {payload[0]?.payload?.name}
          </p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color || "#fff" }}>
              {p.name}:{" "}
              {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
      {/* Category Bar Chart */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "oklch(0.12 0.02 265)",
          border: "1px solid oklch(0.22 0.02 265)",
        }}
      >
        <h3 className="text-card-title text-white mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-blue-400" /> Ideas by Category (Top
          10)
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={catData}
            layout="vertical"
            margin={{ left: 0, right: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }}
              width={120}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {catData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Pie Chart */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "oklch(0.12 0.02 265)",
          border: "1px solid oklch(0.22 0.02 265)",
        }}
      >
        <h3 className="text-card-title text-white mb-4 flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-emerald-400" /> Growth Trend
          Distribution
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={trendData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {trendData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={value => (
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top 10 Earning Potential */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "oklch(0.12 0.02 265)",
          border: "1px solid oklch(0.22 0.02 265)",
        }}
      >
        <h3 className="text-card-title text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-400" /> Top 10 by Earning
          Potential ($M/yr)
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={top10Earning}
            layout="vertical"
            margin={{ left: 0, right: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              unit="M"
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }}
              width={130}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Max Earning ($M)">
              {top10Earning.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scatter: Cost vs Margin */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "oklch(0.12 0.02 265)",
          border: "1px solid oklch(0.22 0.02 265)",
        }}
      >
        <h3 className="text-card-title text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-400" /> Startup Cost vs.
          Profit Margin
        </h3>
        <p className="text-body-sm mb-3">
          Bubble size = rollout speed. Top-left = best opportunities.
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
            />
            <XAxis
              dataKey="x"
              name="Startup Cost ($K)"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Cost ($K)",
                fill: "rgba(255,255,255,0.3)",
                fontSize: 10,
                position: "insideBottom",
                offset: -5,
              }}
            />
            <YAxis
              dataKey="y"
              name="Profit Margin %"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Margin %",
                fill: "rgba(255,255,255,0.3)",
                fontSize: 10,
                angle: -90,
                position: "insideLeft",
              }}
            />
            <ZAxis dataKey="z" range={[30, 200]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload?.length) {
                  const d = payload[0]?.payload;
                  return (
                    <div
                      className="rounded-lg p-3 text-xs"
                      style={{
                        background: "oklch(0.15 0.03 265)",
                        border: "1px solid oklch(0.25 0.04 265)",
                      }}
                    >
                      <p className="text-white font-semibold mb-1 max-w-40">
                        {d?.name}
                      </p>
                      <p className="text-amber-400">Cost: ~${d?.x}K</p>
                      <p className="text-emerald-400">Margin: {d?.y}%</p>
                      <p className="text-blue-400">Speed: {d?.z}/10</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter
              data={scatterData}
              shape={(props: any) => {
                const { cx, cy, payload } = props;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={props.r || 5}
                    fill={payload.color}
                    fillOpacity={0.7}
                    stroke={payload.color}
                    strokeWidth={1}
                  />
                );
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default function Home() {
  const [selectedIdea, setSelectedIdea] = useState<BusinessIdea | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMarket, setSelectedMarket] = useState("all");
  const [selectedTrend, setSelectedTrend] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rank");
  const [showCharts, setShowCharts] = useState(true);
  const [visibleCount, setVisibleCount] = useState(24);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonIdeas, setComparisonIdeas] = useState<BusinessIdea[]>([]);
  const [showShortlistOnly, setShowShortlistOnly] = useState(false);

  // REAL-FIRST: Fetch live venture insights from Go/Python backend
  const { data: remoteIdeas, isLoading } = useQuery({
    queryKey: ["venture-insights"],
    queryFn: () => ventureApi.getInsights(),
    retry: 1,
  });

  // Fallback to static research data only if backend is unreachable or empty
  const businessIdeas =
    remoteIdeas && remoteIdeas.length > 0 ? remoteIdeas : mockIdeas;
  const {
    shortlist,
    isLoaded,
    toggle: toggleShortlist,
    isInShortlist,
  } = useShortlist();

  const filtered = useMemo(() => {
    let result = businessIdeas;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== "all")
      result = result.filter(i => i.category === selectedCategory);
    if (selectedMarket !== "all")
      result = result.filter(i => i.markets.includes(selectedMarket));
    if (selectedTrend !== "all")
      result = result.filter(i => i.trend === selectedTrend);
    if (showShortlistOnly) result = result.filter(i => isInShortlist(i.id));

    return [...result].sort((a, b) => {
      if (sortBy === "rank") return a.rank - b.rank;
      if (sortBy === "earning")
        return b.earning_potential - a.earning_potential;
      if (sortBy === "speed") return b.rollout_speed - a.rollout_speed;
      if (sortBy === "margin") return b.profit_margin - a.profit_margin;
      if (sortBy === "market_size") return b.market_size_bn - a.market_size_bn;
      return 0;
    });
  }, [search, selectedCategory, selectedMarket, selectedTrend, sortBy]);

  const hasFilters =
    search ||
    selectedCategory !== "all" ||
    selectedMarket !== "all" ||
    selectedTrend !== "all";

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedMarket("all");
    setSelectedTrend("all");
    setVisibleCount(24);
  };

  const visibleIdeas = filtered.slice(0, visibleCount);
  const shortlistedIdeas = businessIdeas.filter(i => isInShortlist(i.id));

  const addToComparison = (idea: BusinessIdea) => {
    if (comparisonIdeas.find(i => i.id === idea.id)) {
      setComparisonIdeas(comparisonIdeas.filter(i => i.id !== idea.id));
    } else if (comparisonIdeas.length < 3) {
      setComparisonIdeas([...comparisonIdeas, idea]);
    }
  };

  const isInComparison = (ideaId: number) =>
    comparisonIdeas.some(i => i.id === ideaId);

  const handleExportFiltered = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    exportToCSV(filtered, `business-ideas-${timestamp}.csv`);
  };

  const handleExportPDF = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    exportToPDF(filtered, `business-ideas-${timestamp}.pdf`);
  };

  const handleExportShortlist = () => {
    if (shortlistedIdeas.length === 0) return;
    const timestamp = new Date().toISOString().split("T")[0];
    exportShortlistToPDF(shortlistedIdeas, `my-shortlist-${timestamp}.pdf`);
  };

  // Summary stats
  const explosiveCount = businessIdeas.filter(
    i => i.trend === "Explosive"
  ).length;
  const avgMargin = Math.round(
    businessIdeas.reduce((s, i) => s + i.profit_margin, 0) /
      businessIdeas.length
  );
  const fastRollout = businessIdeas.filter(i => i.rollout_speed >= 9).length;

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.09 0.02 265)" }}
    >
      {/* NAV */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{
          background: "oklch(0.09 0.02 265 / 0.9)",
          borderColor: "oklch(0.22 0.02 265)",
        }}
      >
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #22c55e)",
              }}
            >
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-card-title text-white">
              Business Intelligence Hub
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-xs text-white/50">
              <span>US · UK · EU · Canada</span>
              <span
                className="px-2 py-1 rounded-full text-emerald-400 font-semibold"
                style={{ background: "oklch(0.72 0.18 145 / 0.15)" }}
              >
                2026 Research Report
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowComparison(comparisonIdeas.length > 0)}
                className="relative p-2 rounded-lg transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={comparisonIdeas.length === 0}
                title={`Compare (${comparisonIdeas.length}/3 selected)`}
              >
                <Columns3 className="w-4 h-4 text-white/60" />
                {comparisonIdeas.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                    {comparisonIdeas.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  if (shortlistedIdeas.length === 0) {
                    toast.info(
                      "No ideas in shortlist yet. Click the bookmark icon on any idea to add it."
                    );
                  } else {
                    setShowShortlistOnly(!showShortlistOnly);
                    toast.info(
                      showShortlistOnly
                        ? `Showing all ideas`
                        : `Showing ${shortlistedIdeas.length} shortlisted ideas`
                    );
                  }
                }}
                className={`relative p-2 rounded-lg transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed ${showShortlistOnly ? "bg-blue-500/20 text-blue-400" : ""}`}
                disabled={shortlistedIdeas.length === 0}
                title={`Shortlist (${shortlistedIdeas.length} saved)`}
              >
                <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                {shortlistedIdeas.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">
                    {shortlistedIdeas.length}
                  </span>
                )}
              </button>
              <div className="relative group">
                <button
                  className="p-2 rounded-lg transition-all hover:bg-white/10"
                  data-testid="export-dropdown-btn"
                >
                  <Download className="w-4 h-4 text-white/60" />
                </button>
                <div
                  className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
                  style={{
                    background: "oklch(0.14 0.02 265)",
                    border: "1px solid oklch(0.25 0.04 265)",
                  }}
                >
                  <button
                    onClick={handleExportFiltered}
                    className="w-full text-left px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-t-lg"
                  >
                    Export Filtered (CSV)
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="w-full text-left px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Export Filtered (PDF)
                  </button>
                  <button
                    onClick={handleExportShortlist}
                    className="w-full text-left px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-b-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={shortlistedIdeas.length === 0}
                  >
                    Export Shortlist (PDF)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative overflow-hidden" style={{ minHeight: "480px" }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})`, opacity: 0.25 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, oklch(0.09 0.02 265 / 0.3), oklch(0.09 0.02 265))",
          }}
        />

        <div className="relative container pt-20 pb-16">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-kicker mb-6"
              style={{
                background: "oklch(0.65 0.2 250 / 0.15)",
                color: "#93c5fd",
                border: "1px solid oklch(0.65 0.2 250 / 0.3)",
              }}
            >
              <Zap className="w-3 h-3" /> Gap Analysis · High-Earning
              Opportunities · Fast Rollout
            </div>
            <h1 className="text-display-hero text-white mb-5">
              Top 100 <span className="text-gradient-premium">High-Earning</span>
              <br />
              Business Ideas 2026
            </h1>
            <p className="text-subheadline mb-10 max-w-2xl text-balance">
              Comprehensive gap analysis of the most profitable, fast-rollout
              business opportunities across the US, UK, EU, and Canada — with
              market size, earning potential, and actionable insights.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 -mt-10 mb-12">
              <StatCounter
                value={businessIdeas.length}
                label="Business Ideas"
                suffix={businessIdeas.length >= 100 ? "+" : ""}
              />
              <StatCounter value={explosiveCount} label="Explosive Trends" />
              <StatCounter value={avgMargin} label="Avg Profit %" suffix="%" />
              <StatCounter value={fastRollout} label="Fast Rollout (<1mo)" />
            </div>
          </div>
        </div>
      </div>

      <div className="container pb-20">
        {/* Charts Toggle */}
        <div className="flex items-center justify-between mb-6">
          <h2
            data-testid="market-intel-header"
            className="text-section-headline text-white"
          >
            Market Intelligence
          </h2>
          <button
            onClick={() => setShowCharts(v => !v)}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
            data-testid="charts-toggle-btn"
          >
            <BarChart2 className="w-4 h-4" />
            {showCharts ? "Hide Charts" : "Show Charts"}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showCharts ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {showCharts && (
          <ChartsSection
            ideas={filtered.length > 0 ? filtered : businessIdeas}
          />
        )}

        {/* Filter Bar */}
        <div
          className="rounded-2xl p-5 mb-8"
          style={{
            background: "oklch(0.12 0.02 265)",
            border: "1px solid oklch(0.22 0.02 265)",
          }}
        >
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setVisibleCount(24);
                }}
                placeholder="Search ideas, categories, tags..."
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50"
                data-testid="search-input"
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={v => {
                setSelectedCategory(v);
                setVisibleCount(24);
              }}
            >
              <SelectTrigger
                className="w-48 bg-white/5 border-white/10 text-white"
                data-testid="category-select"
              >
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: "oklch(0.14 0.02 265)",
                  border: "1px solid oklch(0.25 0.04 265)",
                }}
              >
                <SelectItem value="all">All Categories</SelectItem>
                {ALL_CATEGORIES.map(c => (
                  <SelectItem
                    key={c}
                    value={c}
                    data-testid={`category-item-${c.toLowerCase()}`}
                  >
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedMarket}
              onValueChange={v => {
                setSelectedMarket(v);
                setVisibleCount(24);
              }}
            >
              <SelectTrigger
                className="w-36 bg-white/5 border-white/10 text-white"
                data-testid="market-select"
              >
                <SelectValue placeholder="All Markets" />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: "oklch(0.14 0.02 265)",
                  border: "1px solid oklch(0.25 0.04 265)",
                }}
              >
                <SelectItem value="all">All Markets</SelectItem>
                {ALL_MARKETS.map(m => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedTrend}
              onValueChange={v => {
                setSelectedTrend(v);
                setVisibleCount(24);
              }}
            >
              <SelectTrigger
                className="w-40 bg-white/5 border-white/10 text-white"
                data-testid="trend-select"
              >
                <SelectValue placeholder="All Trends" />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: "oklch(0.14 0.02 265)",
                  border: "1px solid oklch(0.25 0.04 265)",
                }}
              >
                <SelectItem value="all">All Trends</SelectItem>
                {ALL_TRENDS.map(t => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={setSortBy}
              data-testid="sort-select"
            >
              <SelectTrigger className="w-44 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: "oklch(0.14 0.02 265)",
                  border: "1px solid oklch(0.25 0.04 265)",
                }}
              >
                <SelectItem value="rank">Sort: Rank</SelectItem>
                <SelectItem value="earning">Sort: Earning Potential</SelectItem>
                <SelectItem value="speed">Sort: Rollout Speed</SelectItem>
                <SelectItem value="margin">Sort: Profit Margin</SelectItem>
                <SelectItem value="market_size">Sort: Market Size</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
                data-testid="clear-filters-btn"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/8">
            <Filter className="w-3.5 h-3.5 text-white/30" />
            <span className="text-body-sm text-white/50">
              Showing{" "}
              <span className="text-white/80 font-semibold">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="text-white/80 font-semibold">
                {businessIdeas.length}
              </span>{" "}
              ideas
            </span>
            {hasFilters && (
              <div className="flex flex-wrap gap-1.5">
                {selectedCategory !== "all" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                    {selectedCategory}
                  </span>
                )}
                {selectedMarket !== "all" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    {selectedMarket}
                  </span>
                )}
                {selectedTrend !== "all" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    {selectedTrend}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ideas Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-white/15 text-6xl mb-4">🔍</div>
            <p className="text-body text-white/50 text-lg mb-2">
              No ideas match your filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {visibleIdeas.map((idea, index) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  index={index}
                  onClick={() => setSelectedIdea(idea)}
                  onBookmark={() => toggleShortlist(idea.id)}
                  isBookmarked={isInShortlist(idea.id)}
                  onCompare={() => addToComparison(idea)}
                  isInComparison={isInComparison(idea.id)}
                />
              ))}
            </div>

            {visibleCount < filtered.length && (
              <div className="text-center">
                <button
                  onClick={() => setVisibleCount(v => v + 24)}
                  className="px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 font-display tracking-tight"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #22c55e)",
                    color: "white",
                  }}
                >
                  Load More Ideas ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/8 text-center">
          <p className="text-body-sm text-white/40">
            Research compiled from US Chamber of Commerce, McKinsey Global
            Institute, Deloitte, PwC, EU Commission reports, and industry
            databases. Data reflects 2026 market conditions.
          </p>
          <p className="text-xs text-white/25 mt-2 tracking-wide">
            Markets covered: United States · United Kingdom · European Union ·
            Canada
          </p>
        </div>
      </div>

      {/* Modal */}
      {selectedIdea &&
        (selectedIdea.gtm_strategy ? (
          <IdeaDetailEnhanced
            idea={selectedIdea}
            onClose={() => setSelectedIdea(null)}
          />
        ) : (
          <IdeaModal
            idea={selectedIdea}
            onClose={() => setSelectedIdea(null)}
          />
        ))}

      {/* Comparison View */}
      {showComparison && (
        <ComparisonView
          ideas={comparisonIdeas}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}

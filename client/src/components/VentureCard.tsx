import { 
  type BusinessIdea, 
  CATEGORY_COLORS, 
  TREND_COLORS 
} from "@/lib/api";
import { 
  Bookmark, 
  BookmarkCheck, 
  Columns3, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Activity 
} from "lucide-react";
import { type LayoutMode } from "@/hooks/useBusinessIdeas";

interface VentureCardProps {
  idea: BusinessIdea;
  index: number;
  mode: LayoutMode;
  onClick: () => void;
  onBookmark: () => void;
  isBookmarked: boolean;
  onCompare: () => void;
  isInComparison: boolean;
}

export function VentureCard({
  idea,
  index,
  mode,
  onClick,
  onBookmark,
  isBookmarked,
  onCompare,
  isInComparison,
}: VentureCardProps) {
  const catColor = CATEGORY_COLORS[idea.category] || "#6366f1";
  const trendColor = TREND_COLORS[idea.trend];

  if (mode === "alpha") {
    // V1: Intelligence Dashboard Style
    return (
      <div
        className="idea-card rounded-xl p-5 cursor-pointer relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
        style={{
          background: "oklch(0.12 0.02 265)",
          border: "1px solid oklch(0.22 0.02 265)",
          animationDelay: `${(index % 12) * 50}ms`,
          animation: "card-enter 0.4s ease-out forwards",
          opacity: 0,
        }}
        onClick={onClick}
      >
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
        <div className="mb-3">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-md"
            style={{ backgroundColor: catColor + "18", color: catColor }}
          >
            {idea.category}
          </span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2 pr-10 font-display tracking-tight">{idea.title}</h3>
        <p className="text-sm text-white/50 mb-4 line-clamp-2">{idea.description}</p>
        
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-white/30">Rollout Speed</span>
              <span className="text-[10px] font-bold text-emerald-400">{idea.rollout_label}</span>
            </div>
            <div className="h-1 rounded-full bg-white/5">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${idea.rollout_speed * 10}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-white/30">Margin</span>
              <span className="text-[10px] font-bold text-blue-400">{idea.profit_margin}%</span>
            </div>
            <div className="h-1 rounded-full bg-white/5">
              <div className="h-full rounded-full bg-blue-500" style={{ width: `${idea.profit_margin}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <span 
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: trendColor + "22", color: trendColor, border: `1px solid ${trendColor}33` }}
          >
            <Activity className="w-3 h-3" />
            {idea.trend}
          </span>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onBookmark(); }}
              className={`p-1.5 rounded-lg transition-all ${isBookmarked ? 'text-emerald-400 bg-emerald-400/10' : 'text-white/20 hover:text-white/40'}`}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onCompare(); }}
              className={`p-1.5 rounded-lg transition-all ${isInComparison ? 'text-blue-400 bg-blue-400/10' : 'text-white/20 hover:text-white/40'}`}
            >
              <Columns3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "sigma") {
    // V2: SaaS Bento Style
    return (
      <div
        className="group relative flex flex-col justify-between p-8 rounded-3xl cursor-pointer transition-all hover:bg-[#1f1f23]"
        style={{
          background: "#1a1a1a",
          border: "1px solid #27272a",
          height: "380px",
          fontFamily: "'Geist', sans-serif",
        }}
        onClick={onClick}
      >
        <div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black tracking-[0.2em] text-[#A855F7] uppercase">
              {idea.category}
            </span>
            <span className="text-[10px] font-mono text-white/30">RANK_{idea.rank.toString().padStart(3, '0')}</span>
          </div>
          <h3 className="text-2xl font-black text-white mb-3 tracking-tight leading-none group-hover:text-[#A855F7] transition-colors">
            {idea.title}
          </h3>
          <p className="text-sm text-white/40 leading-relaxed max-w-[280px]">
            {idea.description}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-mono text-white/40">
              <span>MARKET_READINESS</span>
              <span>{idea.rollout_speed * 10}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#27272a]">
              <div 
                className="h-full rounded-full bg-[#A855F7] shadow-[0_0_12px_rgba(168,85,247,0.4)]" 
                style={{ width: `${idea.rollout_speed * 10}%` }} 
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[16px] font-black text-white font-mono leading-none">
                ${(idea.earning_potential / 1000000).toFixed(1)}M
              </span>
              <span className="text-[10px] text-white/20 font-mono mt-1">EST_POTENTIAL</span>
            </div>
            <button
              className="px-4 py-2 rounded-xl bg-white text-black text-[12px] font-bold hover:bg-[#A855F7] hover:text-white transition-all"
              onClick={(e) => { e.stopPropagation(); onClick(); }}
            >
              Analyze →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // V3: Cyber Intelligence / Spatial Plus Style
  return (
    <div
      className="relative flex flex-col justify-between p-8 rounded-xl cursor-pointer border border-[#cccccc] bg-white transition-all hover:bg-black group"
      style={{
        height: "320px",
        fontFamily: "'IBM Plex Mono', monospace",
      }}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-[#666666] group-hover:text-white/40 transition-colors">
          [ID_{idea.rank.toString().padStart(3, '0')}]
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onBookmark(); }}
          className={`text-[#00ff00] transition-all ${isBookmarked ? 'scale-110' : 'opacity-20 group-hover:opacity-100 hover:scale-110'}`}
        >
          {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </div>

      <div className="space-y-4">
        <h3 
          className="text-2xl font-black text-black leading-tight uppercase group-hover:text-white transition-colors"
          style={{ fontFamily: "'Anton', sans-serif" }}
        >
          {idea.title.split(":")[0]}
        </h3>
        <div className="flex flex-wrap gap-2">
          {idea.markets.slice(0, 2).map((m) => (
            <span key={m} className="px-2 py-0.5 text-[9px] font-bold bg-[#00ff00] text-black rounded">
              {m.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <span className="block text-[8px] font-bold text-[#999999]">STRATEGIC_FIT</span>
          <span className="text-xl font-black text-black group-hover:text-[#00ff00] transition-colors">
            {idea.profit_margin}%+
          </span>
        </div>
        <span className="text-2xl text-[#00ff00] font-bold">+</span>
      </div>
    </div>
  );
}

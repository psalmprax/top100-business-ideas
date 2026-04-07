import { 
  type BusinessIdea,
  ALL_CATEGORIES,
} from "@/lib/api";
import { 
  Search, 
  ChevronDown, 
  Zap, 
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VentureCard } from "@/components/VentureCard";
import { useState, useRef, useEffect } from "react";

interface LayoutProps {
  ideas: BusinessIdea[];
  filtered: BusinessIdea[];
  visibleIdeas: BusinessIdea[];
  search: string;
  setSearch: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedMarket: string;
  setSelectedMarket: (v: string) => void;
  selectedTrend: string;
  setSelectedTrend: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  hasFilters: boolean;
  clearFilters: () => void;
  visibleCount: number;
  setVisibleCount: (v: number) => void;
  isLoading: boolean;
  onIdeaClick: (idea: BusinessIdea) => void;
  toggleShortlist: (id: number) => void;
  isInShortlist: (id: number) => boolean;
  addToComparison: (idea: BusinessIdea) => void;
  isInComparison: (id: number) => boolean;
  stats: any;
}

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

function StatCounter({ value, label, prefix = "", suffix = "" }: any) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(value, 1800, visible);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center p-4 rounded-xl bg-white/5 border border-white/5">
      <div className="text-2xl font-black text-white mb-1 tabular-nums">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-[10px] uppercase tracking-widest font-bold text-white/40">{label}</div>
    </div>
  );
}

export function V1_IntelligenceDashboard(props: LayoutProps) {
  return (
    <div className="space-y-10 pb-20">
      {/* HERO SECTION */}
      <div className="relative pt-20 pb-16 px-6 rounded-3xl overflow-hidden border border-white/5" style={{ background: "oklch(0.12 0.02 265)" }}>
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6">
            <Zap className="w-3 h-3" /> 2026 ALPHA VENTURE REPORT
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-[1.1] font-display">
            Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-amber-400">Workspace</span>
          </h1>
          <p className="text-lg text-white/60 mb-10 max-w-2xl leading-relaxed">
            Discover high-potential business opportunities across US, UK, and EU markets. 
            Real-time gap analysis and profit mapping at your fingertips.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCounter value={props.stats.totalCount} label="Business Ideas" suffix="+" />
            <StatCounter value={props.stats.explosiveCount} label="Explosive Trends" />
            <StatCounter value={props.stats.avgMargin} label="Avg Profit %" suffix="%" />
            <StatCounter value={props.stats.fastRollout} label="Fast Rollout" />
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="sticky top-20 z-40 bg-black/60 backdrop-blur-xl rounded-2xl p-4 border border-white/5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              value={props.search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setSearch(e.target.value)}
              placeholder="Search intelligence..."
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          <Select value={props.selectedCategory} onValueChange={props.setSelectedCategory}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
              <SelectItem value="all">All Categories</SelectItem>
              {ALL_CATEGORIES.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={props.sortBy} onValueChange={props.setSortBy}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
              <SelectItem value="rank">Rank</SelectItem>
              <SelectItem value="earning">Earning Potential</SelectItem>
              <SelectItem value="margin">Profit Margin</SelectItem>
            </SelectContent>
          </Select>
          {props.hasFilters && (
            <button onClick={props.clearFilters} className="text-red-400 text-xs font-bold px-3 py-2 flex items-center gap-1 hover:bg-red-500/10 rounded-lg">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* GRID */}
      {props.visibleIdeas.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
          <p className="text-white/30">No intelligence matches your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {props.visibleIdeas.map((idea, index) => (
            <VentureCard
              key={idea.id}
              idea={idea}
              index={index}
              mode="alpha"
              onClick={() => props.onIdeaClick(idea)}
              onBookmark={() => props.toggleShortlist(idea.id)}
              isBookmarked={props.isInShortlist(idea.id)}
              onCompare={() => props.addToComparison(idea)}
              isInComparison={props.isInComparison(idea.id)}
            />
          ))}
        </div>
      )}

      {props.visibleCount < props.filtered.length && (
        <div className="text-center">
          <button
            onClick={() => props.setVisibleCount(props.visibleCount + 24)}
            className="px-10 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
          >
            Load More Results
          </button>
        </div>
      )}
    </div>
  );
}

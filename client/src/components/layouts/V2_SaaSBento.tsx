import { type BusinessIdea } from "@/lib/api";
import { 
  Search, 
  BarChart2, 
  ChevronDown, 
  Zap, 
  Filter, 
  X,
  TrendingUp,
  LayoutGrid,
  Activity,
  ArrowRight
} from "lucide-react";
import { VentureCard } from "@/components/VentureCard";
import { useState } from "react";

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

export function V2_SaaSBento(props: LayoutProps) {
  const [activeTab, setActiveTab] = useState("market");

  return (
    <div className="space-y-12 pb-24" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-10 border-b border-[#27272a]">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#A855F7] font-mono text-[10px] uppercase font-black tracking-[0.3em]">
            <Activity className="w-3 h-3" /> Alpha_Analytics_System
          </div>
          <h1 className="text-5xl font-black text-white leading-none tracking-tight">Intelligence Hub</h1>
          <p className="text-lg text-white/40 max-w-xl leading-relaxed">
            Discover and analyze high-potential business ventures with precision. 
            Real-time insights for the next generation of builders.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#1a1a1a] p-1.5 rounded-2xl border border-[#27272a]">
          <button className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-black hover:bg-[#A855F7] hover:text-white transition-all">
            Market Stats
          </button>
          <button className="px-5 py-2.5 rounded-xl text-white/40 text-xs font-bold hover:text-white transition-all">
            Reports
          </button>
        </div>
      </header>

      {/* BENTO STATS CLUSTER */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3 flex flex-col justify-between p-8 rounded-[32px] bg-[#1a1a1a] border border-[#27272a] h-[200px]">
          <span className="text-[10px] font-black tracking-[0.2em] text-white/20 uppercase">Active Ventures</span>
          <span className="text-5xl font-black text-white font-mono">{props.stats.totalCount}</span>
        </div>
        
        <div className="md:col-span-6 flex items-center justify-between p-8 rounded-[32px] bg-[#1a1a1a] border border-[#27272a] h-[200px] overflow-hidden relative group cursor-pointer">
          <div className="z-10 space-y-2">
            <span className="inline-flex px-3 py-1 rounded-full bg-[#A855F7]/20 text-[#A855F7] text-[10px] font-black tracking-widest mb-2">TRENDING_ANALYSIS</span>
            <h2 className="text-3xl font-black text-white leading-tight">AI Personal Styling is surging.</h2>
          </div>
          <button className="z-10 px-6 py-3 rounded-full bg-white text-black text-sm font-black hover:bg-[#A855F7] hover:text-white transition-all">
            Explore →
          </button>
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-[#A855F7]/10 to-transparent pointer-events-none group-hover:from-[#A855F7]/20 transition-all" />
        </div>

        <div className="md:col-span-3 flex flex-col justify-between p-8 rounded-[32px] bg-[#1a1a1a] border border-[#27272a] h-[200px]">
          <span className="text-[10px] font-black tracking-[0.2em] text-white/20 uppercase">Profit potential</span>
          <span className="text-5xl font-black text-[#A855F7] font-mono">${(props.stats.avgMargin * 25).toFixed(1)}M</span>
        </div>
      </div>

      {/* SEARCH & FILTERS - Clean SaaS style */}
      <div className="flex flex-wrap items-center gap-4 py-8 px-8 rounded-3xl bg-[#111111] border border-[#27272a]">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            value={props.search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-[#1a1a1a] border border-[#27272a] text-white placeholder:text-white/20 text-sm focus:border-[#A855F7] outline-none transition-all"
            placeholder="Search market keywords..."
          />
        </div>
        <div className="h-10 w-[1px] bg-[#27272a] hidden md:block" />
        <div className="flex items-center gap-3">
          <button 
            onClick={props.clearFilters}
            className={`px-6 py-4 rounded-2xl border text-sm font-bold transition-all ${props.hasFilters ? 'border-red-500/50 text-red-400 bg-red-500/5 hover:bg-red-500/10' : 'border-[#27272a] text-white/40 cursor-not-allowed'}`}
          >
            Reset
          </button>
          <button className="px-6 py-4 rounded-2xl border border-[#27272a] bg-[#1a1a1a] text-white text-sm font-bold flex items-center gap-2 hover:border-white transition-all">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* CONTENT GRID */}
      {props.visibleIdeas.length === 0 ? (
        <div className="py-32 text-center space-y-4">
          <div className="text-white/10 text-6xl font-black opacity-20">NO_RESULTS</div>
          <p className="text-white/40 font-mono text-sm tracking-widest">ERROR_CODE: 404_NOT_FOUND</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {props.visibleIdeas.map((idea, index) => (
            <VentureCard
              key={idea.id}
              idea={idea}
              index={index}
              mode="sigma"
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
        <div className="flex justify-center pt-10">
          <button
            onClick={() => props.setVisibleCount(props.visibleCount + 12)}
            className="px-12 py-5 rounded-3xl bg-white text-black font-black text-sm hover:bg-[#A855F7] hover:text-white transition-all shadow-xl"
          >
            LOAD_NEXT_BATCH
          </button>
        </div>
      )}
    </div>
  );
}

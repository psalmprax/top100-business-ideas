import { type BusinessIdea } from "@/lib/api";
import { 
  Search, 
  BarChart2, 
  Plus, 
  Filter, 
  X,
  TrendingUp,
  Activity,
  Maximize2
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

export function V3_CyberIntelligence(props: LayoutProps) {
  return (
    <div className="bg-white min-h-screen text-black" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* MONUMENTAL HERO */}
      <div className="relative pt-32 pb-48 px-10 bg-black rounded-b-[40px] text-white">
        <div className="flex justify-between items-start mb-24">
          <span className="text-[14px] font-bold text-[#00ff00]">[ALPHA_SYSTEM_V3]</span>
          <div className="flex gap-8 text-[12px] font-bold">
            <span>_WORK_SPACE</span>
            <span className="text-white/40">_ANALYTICS</span>
          </div>
        </div>
        
        <div className="max-w-6xl">
          <div className="text-[12px] font-bold text-[#00ff00] mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" /> TREND_ANALYSIS_MARKET_GAP
          </div>
          <h1 className="text-[120px] md:text-[180px] font-black leading-[0.8] mb-12 uppercase tracking-tighter" style={{ fontFamily: "'Anton', sans-serif" }}>
            ALPHA AI™
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <p className="text-2xl font-bold leading-tight max-w-md">
              High-impact venture analysis and strategic market modeling. Real-time intelligence for the elite builder.
            </p>
            <div className="flex gap-12 border-t border-white/20 pt-8 mt-auto">
              <div>
                <span className="block text-[10px] text-white/40 mb-2 uppercase tracking-widest">Active_Ventures</span>
                <span className="text-4xl font-black">{props.stats.totalCount}</span>
              </div>
              <div>
                <span className="block text-[10px] text-white/40 mb-2 uppercase tracking-widest">Avg_Margin</span>
                <span className="text-4xl font-black text-[#00ff00]">{props.stats.avgMargin}%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Perspective Label */}
        <div className="absolute bottom-10 left-10 rotate-90 origin-left text-[10px] font-bold tracking-[0.5em] text-white/20">
          SYSTEM_VERSION_3.0_OMEGA
        </div>
      </div>

      {/* SEARCH SYSTEM - Industrial Style */}
      <div className="container -mt-20">
        <div className="bg-white border-2 border-black p-10 shadow-[20px_20px_0px_#000000]">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <label className="text-[10px] font-black uppercase tracking-tighter">_SEARCH_DATABASE</label>
              <div className="relative">
                <input 
                  value={props.search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setSearch(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-black py-4 text-3xl font-black outline-none placeholder:text-black/10 focus:border-[#00ff00] transition-colors"
                  placeholder="ID_KWD_NAME..."
                />
              </div>
            </div>
            <div className="md:w-64 space-y-4">
              <label className="text-[10px] font-black uppercase tracking-tighter">_FILTER_BY_CAT</label>
              <div className="relative border-2 border-black p-3 hover:bg-[#00ff00] transition-all cursor-pointer">
                <span className="text-xs font-bold uppercase">{props.selectedCategory === 'all' ? 'ALL_CATEGORIES' : props.selectedCategory}</span>
                <Plus className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" />
              </div>
              <button 
                onClick={props.clearFilters}
                className="w-full py-4 bg-black text-[#00ff00] text-xs font-black uppercase hover:bg-[#00ff00] hover:text-black transition-all"
              >
                Clear_Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className="container py-32 space-y-20">
        <div className="flex justify-between items-end border-b-4 border-black pb-8">
          <h2 className="text-6xl font-black uppercase" style={{ fontFamily: "'Anton', sans-serif" }}>TopTier_Ops</h2>
          <span className="text-sm font-bold text-black/30">COUNT: {props.visibleIdeas.length}</span>
        </div>

        {props.visibleIdeas.length === 0 ? (
          <div className="py-20 text-center border-4 border-black border-dashed">
            <span className="text-4xl font-black opacity-20">NULL_ENTRY</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {props.visibleIdeas.map((idea, index) => (
              <VentureCard
                key={idea.id}
                idea={idea}
                index={index}
                mode="omega"
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
          <div className="pt-20">
            <button
              onClick={() => props.setVisibleCount(props.visibleCount + 12)}
              className="w-full py-10 bg-white border-4 border-black text-4xl font-black uppercase hover:bg-black hover:text-white transition-all"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              FETCH_MORE_DATA_
            </button>
          </div>
        )}
      </div>

      {/* INDUSTRIAL FOOTER */}
      <footer className="footer-industrial p-20 bg-black text-white/40 text-[10px] font-bold uppercase tracking-widest leading-loose">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-20">
          <div className="space-y-4">
            <span className="text-[#00ff00] font-black">INFO_SOURCE</span>
            <p>McKinsey Global, Deloitte Intelligence, EU Market Reports, US Chamber of Commerce.</p>
          </div>
          <div className="space-y-4">
            <span className="text-[#00ff00] font-black">MARKETS_ACTIVE</span>
            <p>UNITED STATES · UNITED KINGDOM · EUROPEAN UNION · CANADA</p>
          </div>
          <div className="col-span-2 text-right flex flex-col justify-end">
            <span className="text-white text-2xl font-black" style={{ fontFamily: "'Anton', sans-serif" }}>EST_2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

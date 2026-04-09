import { useState } from "react";
import { useBusinessIdeas } from "@/hooks/useBusinessIdeas";
import { V1_IntelligenceDashboard } from "@/components/layouts/V1_IntelligenceDashboard";
import { V2_SaaSBento } from "@/components/layouts/V2_SaaSBento";
import { V3_CyberIntelligence } from "@/components/layouts/V3_CyberIntelligence";
import { PerspectiveSwitcher } from "@/components/PerspectiveSwitcher";
import { ComparisonView } from "@/components/ComparisonView";
import { IdeaDetailEnhanced } from "@/components/IdeaDetailEnhanced";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Target, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  BarChart2, 
  Zap, 
  Activity, 
  Globe 
} from "lucide-react";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  ResponsiveContainer 
} from "recharts";
import { CATEGORY_COLORS, TREND_COLORS } from "@/lib/api";

export default function Home() {
  const {
    layoutMode,
    setLayoutMode,
    selectedIdea,
    setSelectedIdea,
    selectedCategory,
    setSelectedCategory,
    selectedMarket,
    setSelectedMarket,
    selectedTrend,
    setSelectedTrend,
    search,
    setSearch,
    sortBy,
    setSortBy,
    visibleCount,
    setVisibleCount,
    comparisonIdeas,
    setComparisonIdeas,
    showShortlistOnly,
    setShowShortlistOnly,
    isLoading,
    businessIdeas,
    filtered,
    visibleIdeas,
    shortlistedIdeas,
    hasFilters,
    clearFilters,
    addToComparison,
    isInComparison,
    toggleShortlist,
    isInShortlist,
    stats,
  } = useBusinessIdeas();

  const [showComparison, setShowComparison] = useState(false);

  const renderLayout = () => {
    const commonProps = {
      ideas: businessIdeas,
      filtered,
      visibleIdeas,
      search,
      setSearch,
      selectedCategory,
      setSelectedCategory,
      selectedMarket,
      setSelectedMarket,
      selectedTrend,
      setSelectedTrend,
      sortBy,
      setSortBy,
      hasFilters,
      clearFilters,
      visibleCount,
      setVisibleCount,
      isLoading,
      onIdeaClick: setSelectedIdea,
      toggleShortlist,
      isInShortlist,
      addToComparison,
      isInComparison,
      stats,
    };

    switch (layoutMode) {
      case "sigma":
        return <V2_SaaSBento {...commonProps} />;
      case "omega":
        return <V3_CyberIntelligence {...commonProps} />;
      case "alpha":
      default:
        return <V1_IntelligenceDashboard {...commonProps} />;
    }
  };

  return (
    <div className={`min-h-screen ${layoutMode === 'omega' ? 'bg-white' : ''}`} style={{ background: layoutMode === 'omega' ? '#ffffff' : 'oklch(0.09 0.02 265)' }}>
      <div className="container mx-auto px-4">
        {renderLayout()}
      </div>

      <PerspectiveSwitcher />

      {/* SHARED MODALS */}
      {selectedIdea && (
        selectedIdea.gtm_strategy ? (
          <IdeaDetailEnhanced
            idea={selectedIdea}
            onClose={() => setSelectedIdea(null)}
          />
        ) : (
          <IdeaModal
            idea={selectedIdea}
            onClose={() => setSelectedIdea(null)}
          />
        )
      )}

      {showComparison && (
        <ComparisonView
          ideas={comparisonIdeas}
          onClose={() => setShowComparison(false)}
        />
      )}

      {/* Floating Comparison FAB */}
      {comparisonIdeas.length > 0 && (
         <button 
           onClick={() => setShowComparison(true)}
           className="fixed bottom-10 left-10 z-[60] bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
         >
           <Activity className="w-4 h-4" /> Compare Ventues ({comparisonIdeas.length}/3)
         </button>
      )}
    </div>
  );
}

// Re-using the original IdeaModal for non-enhanced details
function IdeaModal({ idea, onClose }: { idea: any, onClose: () => void }) {
  const catColor = CATEGORY_COLORS[idea.category] || "#6366f1";
  const trendColor = TREND_COLORS[idea.trend];

  const radarData = [
    { subject: "Earning", value: Math.min((idea.earning_potential / 10000000) * 100, 100) },
    { subject: "Speed", value: idea.rollout_speed * 10 },
    { subject: "Margin", value: idea.profit_margin },
    { subject: "Market", value: Math.min((idea.market_size_bn / 500) * 100, 100) },
    { subject: "Scalability", value: idea.scalability_score || 0 },
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-start gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold" style={{ backgroundColor: catColor + "22", color: catColor, border: `1px solid ${catColor}44` }}>
              #{idea.rank}
            </div>
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md mb-1 inline-block" style={{ backgroundColor: catColor + "18", color: catColor }}>{idea.category}</span>
              <DialogTitle className="text-xl font-bold">{idea.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="p-4 rounded-xl bg-white/5"><p className="text-sm leading-relaxed text-white/70">{idea.description}</p></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
             <MetricBox icon={DollarSign} label="Earning" value={idea.earning_label} color="#f59e0b" />
             <MetricBox icon={Clock} label="Speed" value={idea.rollout_label} color="#22c55e" />
             <MetricBox icon={TrendingUp} label="Margin" value={`${idea.profit_margin}%`} color="#3b82f6" />
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                <Radar name="Score" dataKey="value" stroke={catColor} fill={catColor} fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetricBox({ icon: Icon, label, value, color }: any) {
  return (
    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
      <div className="flex items-center gap-1.5 mb-1" style={{ color }}><Icon className="w-3.5 h-3.5" /><span className="text-[10px] uppercase font-bold tracking-wider opacity-50">{label}</span></div>
      <div className="text-xs font-bold text-white">{value}</div>
    </div>
  );
}

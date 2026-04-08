import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ventureApi,
  type BusinessIdea,
} from "@/lib/api";
import { useShortlist } from "@/hooks/useShortlist";

import { usePerspective, type LayoutPerspective } from "@/contexts/PerspectiveContext";

export function useBusinessIdeas() {
  const { perspective: layoutMode, setPerspective: setLayoutMode } = usePerspective();
  const [selectedIdea, setSelectedIdea] = useState<BusinessIdea | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMarket, setSelectedMarket] = useState("all");
  const [selectedTrend, setSelectedTrend] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rank");
  const [visibleCount, setVisibleCount] = useState(24);
  const [comparisonIdeas, setComparisonIdeas] = useState<BusinessIdea[]>([]);
  const [showShortlistOnly, setShowShortlistOnly] = useState(false);

  // REAL-FIRST: Fetch live venture insights from Go/Python backend
  const { data: remoteIdeas, isLoading } = useQuery({
    queryKey: ["venture-insights"],
    queryFn: () => ventureApi.getInsights(),
    retry: 1,
  });

  const businessIdeas = remoteIdeas || [];
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
  }, [businessIdeas, search, selectedCategory, selectedMarket, selectedTrend, sortBy, showShortlistOnly, isInShortlist]);

  const hasFilters = Boolean(
    search ||
    selectedCategory !== "all" ||
    selectedMarket !== "all" ||
    selectedTrend !== "all" ||
    showShortlistOnly
  );

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedMarket("all");
    setSelectedTrend("all");
    setShowShortlistOnly(false);
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

  // Summary stats
  const explosiveCount = businessIdeas.filter(
    i => i.trend === "Explosive"
  ).length;
  const avgMargin = businessIdeas.length > 0 
    ? Math.round(businessIdeas.reduce((s, i) => s + i.profit_margin, 0) / businessIdeas.length)
    : 0;
  const fastRollout = businessIdeas.filter(i => i.rollout_speed >= 9).length;

  return {
    // State
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
    
    // Data
    isLoading,
    businessIdeas,
    filtered,
    visibleIdeas,
    shortlistedIdeas,
    hasFilters: !!hasFilters,
    
    // Actions
    clearFilters,
    addToComparison,
    isInComparison,
    toggleShortlist,
    isInShortlist,
    
    // Stats
    stats: {
      explosiveCount,
      avgMargin,
      fastRollout,
      totalCount: businessIdeas.length
    }
  };
}

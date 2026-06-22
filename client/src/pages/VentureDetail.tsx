import React from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ventureApi, type BusinessIdea } from "@/lib/api";
import { IdeaDetailEnhanced } from "@/components/IdeaDetailEnhanced";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const VentureDetailPage = () => {
  const [, params] = useRoute("/ventures/:id");
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id) : null;

  const {
    data: idea,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["venture-detail", id],
    queryFn: async () => {
      if (!id) throw new Error("Invalid Venture ID");
      // REAL-FIRST: Fallback to finding in list if detail endpoint is proxying
      const insights = await ventureApi.getInsights();
      const found = insights.find((item: BusinessIdea) => item.id === id);
      if (!found) throw new Error("Venture not found");
      return found;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-caption-premium animate-pulse">
          Synchronizing Venture Intelligence...
        </p>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
        <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl max-w-md">
          <h2 className="text-section-headline mb-2">Venture Out of Reach</h2>
          <p className="text-body-sm text-white/60 mb-6">
            We couldn't retrieve the intelligence for this specific venture. It
            may have been decommissioned or moved to a restricted silo.
          </p>
          <Button
            className="bg-white text-black font-bold"
            onClick={() => setLocation("/market-intelligence")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Intelligence Hub
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <IdeaDetailEnhanced
        idea={idea}
        onClose={() => setLocation("/market-intelligence")}
      />
    </div>
  );
};

export default VentureDetailPage;

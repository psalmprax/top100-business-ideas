/**
 * IdeaDetailEnhanced — stub placeholder
 * Original component was removed during dead-code cleanup.
 */
import type { BusinessIdea } from "@/lib/api";

export function IdeaDetailEnhanced({
  idea,
  onClose,
}: {
  idea: BusinessIdea;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {idea?.title ?? "Venture Detail"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {idea?.category ?? ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold text-white transition-colors"
          >
            Close
          </button>
        </div>
        <p className="text-white/70 text-sm leading-relaxed">
          {idea?.description ??
            "This venture detail view is being rebuilt. Please check back soon."}
        </p>
      </div>
    </div>
  );
}

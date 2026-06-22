/**
 * ComparisonView — stub placeholder
 * Original component was removed during dead-code cleanup.
 */
import type { BusinessIdea } from "@/lib/api";

export function ComparisonView({
  ideas,
  onClose,
}: {
  ideas: BusinessIdea[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-lg w-full mx-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Compare Ventures</h2>
        <p className="text-muted-foreground text-sm">
          Comparison view is being rebuilt. {ideas?.length ?? 0} ventures
          selected.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold text-white transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

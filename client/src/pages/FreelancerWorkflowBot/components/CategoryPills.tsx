import { type LucideIcon } from "lucide-react";
import { type CategoryType, type categoryTabs } from "../FreelancerWorkflowBot";

export function CategoryPills({
  categories,
  categoryTabs,
  activeCategory,
  onCategoryChange,
}: {
  categories: {
    id: CategoryType;
    label: string;
    icon: LucideIcon;
    description: string;
  }[];
  categoryTabs: Record<
    CategoryType,
    { value: string; label: string; icon: LucideIcon }[]
  >;
  activeCategory: CategoryType;
  onCategoryChange: (id: CategoryType) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {categories.map((cat) => (
        <button
          key={cat.id}
          data-testid={`btn-pillar-${cat.id}`}
          onClick={() => onCategoryChange(cat.id)}
          className={`flex flex-col items-start p-5 rounded-2xl border transition-all text-left group relative overflow-hidden ${
            activeCategory === cat.id
              ? "bg-indigo-600/5 border-indigo-500 shadow-sm ring-1 ring-indigo-500/20"
              : "bg-card hover:bg-muted/50 border-border/50"
          }`}
        >
          <div
            className={`p-2.5 rounded-xl mb-4 transition-all duration-300 ${
              activeCategory === cat.id
                ? "bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-600/20"
                : "bg-muted text-muted-foreground group-hover:bg-indigo-100 group-hover:text-indigo-600"
            }`}
          >
            <cat.icon className="w-5 h-5" />
          </div>
          <div className="text-overline text-muted-foreground mb-1">
            {cat.label}
          </div>
          <div className="text-caption-premium">{cat.description}</div>

          {activeCategory === cat.id && (
            <div className="absolute top-0 right-0 p-4">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

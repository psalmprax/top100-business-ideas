import { type LucideIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { type CategoryType } from "../../FreelancerWorkflowBot";

export function TabNavigation({
  activeTab,
  onTabChange,
  categoryTabs,
  activeCategory,
}: {
  activeTab: string;
  onTabChange: (value: string) => void;
  categoryTabs: Record<
    CategoryType,
    { value: string; label: string; icon: LucideIcon }[]
  >;
  activeCategory: CategoryType;
}) {
  return (
    <ScrollArea className="w-full whitespace-nowrap mb-8 pb-2">
      <TabsList className="inline-flex h-11 items-center justify-start gap-2 p-1 bg-muted/50 border border-border/50 rounded-xl overflow-hidden">
        {categoryTabs[activeCategory].map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:bg-background data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm px-6 h-9 text-caption-premium transition-all"
            data-testid={`tab-${tab.value}`}
          >
            <tab.icon className="w-3.5 h-3.5 mr-2" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <ScrollBar orientation="horizontal" className="h-1.5" />
    </ScrollArea>
  );
}

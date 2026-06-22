import { Globe, Plane, MapPin, FileText, DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const TRAVEL_ITEMS = [
  {
    label: "Flights",
    icon: Plane,
    desc: "Search and book flights",
    action: () =>
      toast.info("Flight search: Connect your travel provider"),
  },
  {
    label: "Hotels",
    icon: MapPin,
    desc: "Find accommodation",
    action: () =>
      toast.info("Hotel search: Connect your travel provider"),
  },
  {
    label: "Itinerary",
    icon: FileText,
    desc: "View trip plans",
    action: () => toast.info("No trips planned yet"),
  },
  {
    label: "Expenses",
    icon: DollarSign,
    desc: "Track travel costs",
    action: () => toast.info("Travel expense tracking active"),
  },
];

export function TravelTab() {
  return (
    <Card className="border-border/50">
      <CardHeader className="py-4 border-b border-border/50">
        <CardTitle className="text-caption-premium flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-600" />
          Travel Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {TRAVEL_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="p-6 rounded-lg border border-border/50 hover:bg-muted/50 text-left transition-colors"
            >
              <item.icon className="w-6 h-6 text-indigo-600 mb-3" />
              <div className="text-card-title">{item.label}</div>
              <div className="text-caption-premium mt-1">{item.desc}</div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

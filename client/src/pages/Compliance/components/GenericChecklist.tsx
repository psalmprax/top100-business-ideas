import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GenericChecklistProps {
  title: string;
  description: string;
  items: any[];
  loading: boolean;
  onUpdateStatus: (id: string, status: string) => void;
}

export const GenericChecklist = ({
  title,
  description,
  items,
  loading,
  onUpdateStatus
}: GenericChecklistProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "non_compliant":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "pending":
      default:
        return <Circle className="w-5 h-5 text-zinc-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Compliant</Badge>;
      case "non_compliant":
        return <Badge variant="destructive">Non-Compliant</Badge>;
      case "pending":
      default:
        return <Badge variant="outline" className="text-zinc-500">Pending</Badge>;
    }
  };

  const compliantCount = items.filter(i => i.status === "compliant").length;
  const progress = items.length > 0 ? Math.round((compliantCount / items.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse leading-none">
          Syncing Article Persistence...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{progress}%</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Readiness</div>
            </div>
          </div>
          <Progress value={progress} className="h-1.5 mt-4" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {items.length === 0 ? (
              <div className="text-center p-12 text-muted-foreground">
                No checklist items found for this section.
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/30 transition-all group"
                >
                  <div className="mt-1">{getStatusIcon(item.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{item.title}</h4>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic mb-3">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`text-[10px] h-7 ${item.status === 'compliant' ? 'bg-emerald-500/10 border-emerald-500/30' : ''}`}
                        onClick={() => onUpdateStatus(item.id, "compliant")}
                      >
                        Pass Assessment
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`text-[10px] h-7 ${item.status === 'non_compliant' ? 'bg-red-500/10 border-red-500/30' : ''}`}
                        onClick={() => onUpdateStatus(item.id, "non_compliant")}
                      >
                        Flag Violation
                      </Button>
                      <div className="flex-1" />
                      {item.last_checked && (
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground opacity-50">
                          <Clock className="w-3 h-3" />
                          Last sync: {new Date(item.last_checked).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Footer Info */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-primary" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-primary mr-1">REAL-FIRST PROTECTION:</span> 
          All selections are persisted to the production database and reflected in the aggregate compliance score.
        </div>
      </div>
    </div>
  );
};

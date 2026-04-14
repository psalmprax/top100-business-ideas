import { useState, useEffect } from "react";
import {
  BookOpen,
  Award,
  CheckCircle2,
  PlayCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { extendedApi, type TrainingModule } from "@/lib/api";
import { toast } from "sonner";

export function TrainingSection() {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, []);

  async function loadModules() {
    setLoading(true);
    try {
      const data = await extendedApi.training.modules();
      setModules(data || []);
    } catch (err) {
      console.error("Failed to fetch training modules", err);
    } finally {
      setLoading(false);
    }
  }

  async function startModule(id: string) {
    try {
      await extendedApi.training.updateProgress({
        module_id: id,
        progress: 10,
      });
      toast.success("Training module started");
      loadModules();
    } catch (err) {
      toast.error("Failed to start training module");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-sm font-medium">
          Loading certification catalog...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            Empowerment & Training
          </h3>
          <p className="text-sm text-muted-foreground">
            Article 17 & 18 workforce literacy and deployment readiness
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <Award className="w-4 h-4 text-yellow-500" />
          Certified Personnel:{" "}
          <span className="text-foreground ml-1">12 / 15</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map(mod => (
          <Card
            key={mod.id}
            className="flex flex-col h-full bg-card/40 backdrop-blur-sm border-border/50 hover:border-emerald-500/30 transition-all"
          >
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold tracking-tight"
                >
                  {mod.category}
                </Badge>
                {mod.status === "completed" && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
              </div>
              <CardTitle className="text-base line-clamp-1">
                {mod.title}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-2 min-h-[32px]">
                {mod.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {mod.duration_minutes} min
                </div>
                <div className="font-bold">{mod.progress || 0}%</div>
              </div>
              <Progress value={mod.progress || 0} className="h-1.5" />
            </CardContent>
            <CardFooter className="pt-0 border-t border-border/20 mt-4">
              <Button
                variant={mod.status === "completed" ? "ghost" : "default"}
                className="w-full mt-4 text-xs h-9 justify-between"
                onClick={() => mod.id && startModule(mod.id)}
              >
                {mod.status === "completed"
                  ? "Review Content"
                  : "Continue Training"}
                <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="bg-emerald-500/5 border-emerald-500/20">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Compliance Certification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Enterprise Readiness</span>
                <span className="font-bold">80%</span>
              </div>
              <Progress value={80} className="h-2 bg-emerald-500/20" />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10"
              onClick={async () => {
                try {
                  await extendedApi.training.downloadCertificate(
                    "enterprise-readiness"
                  );
                  toast.success("Report download started");
                } catch (err) {
                  toast.error("Failed to download report");
                }
              }}
            >
              Download Full Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

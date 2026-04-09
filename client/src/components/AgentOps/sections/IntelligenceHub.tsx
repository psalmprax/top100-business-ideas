import { 
  Search, 
  RefreshCw, 
  Zap, 
  Users, 
  Target, 
  Milestone, 
  Brain, 
  Clock, 
  Code 
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface IntelligenceHubProps {
  researchTopic: string;
  setResearchTopic: (t: string) => void;
  isResearching: boolean;
  researchResult: any;
  onRunResearch: () => void;
  strategyPrompt: string;
  setStrategyPrompt: (p: string) => void;
  isGeneratingStrategy: boolean;
  strategyResult: any;
  onGenerateStrategy: () => void;
}

export function IntelligenceHub({
  researchTopic,
  setResearchTopic,
  isResearching,
  researchResult,
  onRunResearch,
  strategyPrompt,
  setStrategyPrompt,
  isGeneratingStrategy,
  strategyResult,
  onGenerateStrategy,
}: IntelligenceHubProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Market Intelligence (Paperclip)
          </CardTitle>
          <CardDescription>Automated competitor scanning and market trend analysis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter market topic (e.g., 'Decentralized Finance')"
              value={researchTopic}
              onChange={e => setResearchTopic(e.target.value)}
              className="bg-background/50"
            />
            <Button onClick={onRunResearch} disabled={isResearching}>
              {isResearching ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Run Research
            </Button>
          </div>

          {researchResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="bg-muted/30 border-primary/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Scanned Competitors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {researchResult.competitors.map((comp: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded bg-background/40 border border-border/50">
                        <span className="font-medium">{comp.name}</span>
                        <Badge variant={comp.status === "dominant" ? "default" : "outline"}>
                          {comp.market_share}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30 border-primary/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    SWOT Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 bg-green-500/5 border border-green-500/20 rounded">
                      <div className="font-bold text-green-500 mb-1 uppercase tracking-tighter">Strengths</div>
                      <ul className="list-disc pl-3 space-y-1">
                        {researchResult.swot.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="p-2 bg-red-500/5 border border-red-500/20 rounded">
                      <div className="font-bold text-red-500 mb-1 uppercase tracking-tighter">Weaknesses</div>
                      <ul className="list-disc pl-3 space-y-1">
                        {researchResult.swot.weaknesses.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="p-2 bg-blue-500/5 border border-blue-500/20 rounded">
                      <div className="font-bold text-blue-500 mb-1 uppercase tracking-tighter">Opportunities</div>
                      <ul className="list-disc pl-3 space-y-1">
                        {researchResult.swot.opportunities.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="p-2 bg-yellow-500/5 border border-yellow-500/20 rounded">
                      <div className="font-bold text-yellow-500 mb-1 uppercase tracking-tighter">Threats</div>
                      <ul className="list-disc pl-3 space-y-1">
                        {researchResult.swot.threats.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Milestone className="w-5 h-5 text-primary" />
            Strategy Engine (Hermes)
          </CardTitle>
          <CardDescription>Translating research assets into roadmaps and UI blueprints.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter project name or idea"
              value={strategyPrompt}
              onChange={e => setStrategyPrompt(e.target.value)}
              className="bg-background/50"
            />
            <Button onClick={onGenerateStrategy} disabled={isGeneratingStrategy}>
              {isGeneratingStrategy ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              Generate Strategy
            </Button>
          </div>

          {strategyResult && (
            <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {strategyResult.roadmap.map((phase: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/40 border border-border/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 text-[8px] font-black opacity-20 group-hover:opacity-100 transition-opacity">PHASE {i + 1}</div>
                    <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{phase.phase}</div>
                    <div className="text-lg font-black mb-1">{phase.goal}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {phase.duration}
                    </div>
                  </div>
                ))}
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    UX Blueprint Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Core Components</div>
                      <div className="flex flex-wrap gap-2">
                        {strategyResult.ux_blueprint.core_components.map((c: string, i: number) => (
                          <Badge key={i} variant="secondary">{c}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Aesthetic Identity</div>
                      <div className="text-sm italic">{strategyResult.ux_blueprint.aesthetic}</div>
                    </div>
                  </div>
                  <Separator className="my-4 opacity-30" />
                  <div className="text-sm font-medium text-primary bg-primary/10 p-3 rounded border border-primary/20">
                    {strategyResult.recommendation}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import React from "react";
import {
  Layers,
  Plus,
  Trash2,
  Cpu,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import type { CustomModel } from "../../types";

interface ModelsSectionProps {
  customModels: CustomModel[];
  onShowDeployDialog: () => void;
  onDeleteModel: (id: string) => void;
}

export function ModelsSection({
  customModels,
  onShowDeployDialog,
  onDeleteModel,
}: ModelsSectionProps) {
  return (
    <Card className="border-purple-500/20 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-purple-500/5 py-6">
        <div>
          <CardTitle className="flex items-center gap-3 text-2xl font-black">
            <Layers className="w-8 h-8 text-purple-500" />
            Custom Detection Models
          </CardTitle>
          <CardDescription className="text-sm font-medium opacity-70">
            Enterprise-specific neural networks and specialized weights for
            targeted defense.
          </CardDescription>
        </div>
        <Button
          onClick={onShowDeployDialog}
          className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Deploy New Model
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">
                Model Signature
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">
                Neural Network
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">
                Efficiency
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest">
                Status
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-6">
                Metadata
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customModels.map(model => (
              <TableRow
                key={model.id}
                className="hover:bg-purple-500/5 transition-colors border-b border-border/30 last:border-0"
              >
                <TableCell className="font-mono text-[10px] opacity-40 pl-6">
                  {model.id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                      <Cpu className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-black">{model.name}</div>
                      <div className="text-[10px] text-muted-foreground font-bold tracking-tight uppercase">
                        Version {model.version} &middot;{" "}
                        {model.type || "Foresnsic"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1.5 min-w-[120px]">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="opacity-60 text-[9px]">ACCURACY</span>
                      <span className="text-purple-400">
                        {(model.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={model.accuracy * 100}
                      className="h-1 bg-purple-500/10"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`text-[9px] h-4 leading-none font-black px-2 ${
                      model.status === "deployed"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}
                    variant="outline"
                  >
                    {model.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {model.lastTrained.toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-white"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => onDeleteModel(model.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {customModels.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-40 text-center text-muted-foreground italic text-sm"
                >
                  <div className="flex flex-col items-center gap-3">
                    <TrendingUp className="w-10 h-10 opacity-20" />
                    No custom neural weights deployed for this jurisdiction.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

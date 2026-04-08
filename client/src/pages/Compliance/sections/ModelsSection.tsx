import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Box, Eye, Trash2 } from "lucide-react";
import { RiskBadge, StatusBadge } from "../components/ComplianceBadges";
import { type AIModel } from "../types";

interface ModelsSectionProps {
  models: AIModel[];
  onViewModel: (model: AIModel) => void;
  onDeleteModel: (id: string) => void;
}

export const ModelsSection = ({
  models,
  onViewModel,
  onDeleteModel,
}: ModelsSectionProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model Registry</TableHead>
              <TableHead>Risk Classification</TableHead>
              <TableHead>Compliance Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Audit Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.length > 0 ? (
              models.map((model) => (
                <TableRow key={model.id} className="hover:bg-muted/50 group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Box className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {model.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {model.endpointUrl && model.endpointUrl.length > 30 
                            ? model.endpointUrl.slice(0, 30) + "..." 
                            : model.endpointUrl || "Local Engine"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RiskBadge category={model.riskCategory} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 w-40">
                      <Progress 
                        value={model.complianceScore} 
                        className="h-1.5 flex-1" 
                      />
                      <span className="text-xs font-mono">
                        {model.complianceScore}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={model.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onViewModel(model)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-500"
                        onClick={() => onDeleteModel(model.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No AI models registered in the registry.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

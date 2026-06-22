import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  Calendar,
  ChevronDown,
  Download,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export function AuditTrailSection() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Compliance Audit Trail</CardTitle>
          <CardDescription>
            Immutable log of all detection activities backed by hardware signing
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-blue-500/30 text-blue-500 bg-blue-500/5 hover:bg-blue-500/10"
            onClick={() => toast.info("Audit scheduler coming soon...")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Recurrent Audit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Batch Actions <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900 border-slate-700 text-white">
              <DropdownMenuItem
                onClick={() => toast.success("Exporting 5 selected logs...")}
              >
                <Download className="w-4 h-4 mr-2" /> Export Selected
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.success("Archiving 5 selected logs...")}
              >
                <Archive className="w-4 h-4 mr-2" /> Archive Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 text-xs border border-white/5 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all group"
            >
              <Checkbox id={`audit-${i}`} checked />
              <div className="flex-1 flex items-center justify-between">
                <span className="font-mono font-bold text-white tracking-wider">
                  AUDIT_LOG_00{i}
                </span>
                <span className="text-muted-foreground hidden md:block">
                  Signed by HW_ENCLAVE_{i}0{i}
                </span>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 px-3"
                  >
                    VERIFIED
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

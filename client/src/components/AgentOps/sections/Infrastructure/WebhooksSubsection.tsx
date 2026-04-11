import React from "react";
import { 
  Zap, 
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WebhooksSubsectionProps {
  webhooks: any[];
  onRegisterWebhook: () => void;
  onRefresh?: () => void;
}

export function WebhooksSubsection({
  webhooks,
  onRegisterWebhook,
  onRefresh,
}: WebhooksSubsectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <Zap className="w-5 h-5 text-primary" />
              Event Webhooks
            </CardTitle>
            <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-60">
              Bi-directional infrastructure event synchronization and alerting.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
              <Input 
                className="pl-9 h-9 bg-background/50 border-border/50 w-[200px] text-xs font-bold" 
                placeholder="Filter endpoints..." 
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={onRefresh}>
               <RefreshCw className="w-4 h-4" />
            </Button>
            <Button 
              className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs px-4 rounded-lg shadow-lg shadow-primary/10"
              onClick={onRegisterWebhook}
            >
              <Plus className="w-4 h-4 mr-2" />
              REGISTER ENDPOINT
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 overflow-hidden bg-background/20">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Endpoint URI</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Environment</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Last Event</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-40">
                      No webhook endpoints configured.
                    </TableCell>
                  </TableRow>
                ) : (
                  webhooks.map(hook => (
                    <TableRow key={hook.id} className="hover:bg-primary/5 transition-colors border-border/10">
                      <TableCell className="font-mono text-xs max-w-[300px] truncate opacity-80">
                        {hook.url || hook.endpoint}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tight border-primary/20 bg-primary/5 text-primary">
                          {hook.environment || 'PRODUCTION'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${hook.active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                          <span className="text-[10px] font-black uppercase tracking-tight">{hook.active ? 'CONNECTED' : 'OFFLINE'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] font-bold tabular-nums opacity-60">
                        {hook.last_triggered ? new Date(hook.last_triggered).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="bg-primary text-primary-foreground font-black text-[10px]">PRO TIP</Badge>
          <p className="text-xs font-bold text-primary/80">Use end-to-end encryption for production webhook endpoints to ensure payload integrity.</p>
        </div>
        <Button variant="link" className="text-primary font-black text-xs uppercase tracking-widest">Documentation</Button>
      </div>
    </div>
  );
}

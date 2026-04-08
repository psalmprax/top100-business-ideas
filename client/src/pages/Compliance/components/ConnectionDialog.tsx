import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Database, Plug, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { connectionTemplates, connectionHelp } from "../constants";

interface ConnectionDialogProps {
  article: any;
  onConnect: (type: string, config: any) => void;
}

export const ConnectionDialog = ({
  article,
  onConnect,
}: ConnectionDialogProps) => {
  const [type, setType] = useState("ci_cd");
  const [config, setConfig] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectContextual = async () => {
    setIsConnecting(true);
    try {
      await onConnect(type, config ? JSON.parse(config) : {});
      setIsOpen(false);
      toast.success(`Handshake successful: ${type} synchronized.`);
    } catch (e: any) {
      toast.error(
        `Handshake failed: ${e.message || "Invalid JSON configuration"}`
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const applyTemplate = () => {
    if (connectionTemplates[type]) {
      setConfig(connectionTemplates[type]);
      toast.info(`Applied ${type.replace("_", " ")} template`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 transition-all active:scale-95"
        >
          <Plug className="w-4 h-4 mr-1" /> Connect System
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            System Handshake: {article.article}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Establish a real technical connection for automated Article{" "}
            {article.article} compliance validation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>System Integration Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="ci_cd">CI/CD Pipeline</SelectItem>
                <SelectItem value="model_registry">Model Registry</SelectItem>
                <SelectItem value="data_store">Training Data Store</SelectItem>
                <SelectItem value="monitoring">Monitoring Hub</SelectItem>
                <SelectItem value="eu_database">Official EU Database</SelectItem>
                <SelectItem value="regulatory_portal">Regulatory Compliance Portal</SelectItem>
                <SelectItem value="vector_db">Vector Database (RAG)</SelectItem>
                <SelectItem value="compute_cluster">Compute & K8s Cluster</SelectItem>
                <SelectItem value="identity_iam">IAM / Identity Provider</SelectItem>
                <SelectItem value="human_feedback">HI-T-L Feedback Platform</SelectItem>
                <SelectItem value="legal_repository">Legal Document Repository</SelectItem>
                <SelectItem value="cloud_infra">Cloud Provider (AWS/GCP/Azure)</SelectItem>
                <SelectItem value="ai_gateway">AI Model Gateway (OpenAI/Claude)</SelectItem>
                <SelectItem value="data_lakehouse">Data Lakehouse (Snowflake/DB)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Integration Config (JSON)</Label>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-blue-400 text-[10px]"
                onClick={applyTemplate}
              >
                Use Template
              </Button>
            </div>
            <Textarea
              className="bg-zinc-900 border-zinc-800 font-mono h-40 focus:ring-blue-500 text-[11px]"
              placeholder={connectionTemplates[type]}
              value={config}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConfig(e.target.value)}
            />
            <div className="p-2 rounded bg-zinc-900/50 border border-zinc-800 flex gap-2 items-start">
              <Info className="w-3 h-3 text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-zinc-400 italic">
                {connectionHelp[type]}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleConnectContextual}
            className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Establishing Handshake...
              </>
            ) : (
              "Execute Handshake"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

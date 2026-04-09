import { useState, useEffect } from "react";
import { 
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogFooter,
} from "@/components/ui/dialog";
import { DashboardAgent } from "./types";

interface AgentSettingsDialogProps {
  agent: DashboardAgent;
  onSave: (updated: any) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function AgentSettingsDialog({
  agent,
  onSave,
  onOpenChange,
}: AgentSettingsDialogProps) {
  const [editedAgent, setEditedAgent] = useState<DashboardAgent>(agent);

  useEffect(() => {
    setEditedAgent(agent);
  }, [agent]);

  const handleSave = () => {
    onSave(editedAgent);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-6 py-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Agent Name</Label>
            <Input
              value={editedAgent.name}
              onChange={e =>
                setEditedAgent(prev => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Data Processor Agent"
            />
          </div>
          <div className="space-y-2">
            <Label>Environment</Label>
            <Select
              value={editedAgent.environment || ""}
              onValueChange={val =>
                setEditedAgent(prev => ({ ...prev, environment: val }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="development">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Agent Tier</Label>
            <Select
              value={editedAgent.tier || "tactical"}
              onValueChange={(val: any) =>
                setEditedAgent(prev => ({ ...prev, tier: val }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strategic">Strategic</SelectItem>
                <SelectItem value="tactical">Tactical</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Organization/Region ID</Label>
            <Input
              value={editedAgent.org_id || ""}
              onChange={e =>
                setEditedAgent(prev => ({ ...prev, org_id: e.target.value }))
              }
              placeholder="e.g., EMEA-SALES-01"
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-500" />
                Persistent Memory (UC7)
              </Label>
              <p className="text-[10px] text-zinc-500">
                Enable recursive context storage for autonomous long-term
                reasoning.
              </p>
            </div>
            <Switch
              checked={editedAgent.persistent_memory || false}
              onCheckedChange={val =>
                setEditedAgent(prev => ({ ...prev, persistent_memory: val }))
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={editedAgent.provider}
                onValueChange={val =>
                  setEditedAgent(prev => ({ ...prev, provider: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                  <SelectItem value="cohere">Cohere</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Select
                value={editedAgent.model}
                onValueChange={val =>
                  setEditedAgent(prev => ({ ...prev, model: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">
                    Claude 3 Sonnet
                  </SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Daily Budget ($)</Label>
              <Input
                type="number"
                value={editedAgent.budget}
                onChange={e =>
                  setEditedAgent(prev => ({
                    ...prev,
                    budget: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="25"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Tokens</Label>
              <Input
                type="number"
                value={editedAgent.config.maxTokens}
                onChange={e =>
                  setEditedAgent(prev => ({
                    ...prev,
                    config: {
                      ...prev.config,
                      maxTokens: parseInt(e.target.value) || 0,
                    },
                  }))
                }
                placeholder="100000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Temperature</Label>
            <Slider
              value={[editedAgent.config.temperature]}
              onValueChange={([val]) =>
                setEditedAgent(prev => ({
                  ...prev,
                  config: { ...prev.config, temperature: val },
                }))
              }
              max={2}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Deterministic (0)</span>
              <span>Current: {editedAgent.config.temperature}</span>
              <span>Creative (2)</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Control Webhook (Active Governance)</Label>
            <Input
              value={editedAgent.control_webhook || ""}
              onChange={e =>
                setEditedAgent(prev => ({
                  ...prev,
                  control_webhook: e.target.value,
                }))
              }
              placeholder="https://api.company.com/agents/control"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </DialogFooter>
    </>
  );
}

import React, { useState } from "react";
import {
  Plus,
  Settings,
  Trash2,
  Globe,
  Webhook,
  ShieldAlert,
  Save,
  Cpu,
  Zap,
  Brain,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}

export function NewAgentDialog({ open, onOpenChange, onSave }: ModalProps) {
  const [data, setData] = useState({
    name: "",
    type: "langgraph",
    environment: "production",
    provider: "openai",
    model: "gpt-4o",
    tier: "industrial",
    persistent_memory: true,
    budget: 50,
    maxTokens: 100000,
    temperature: 0.7,
  });

  const getModelOptions = (provider: string) => {
    switch (provider) {
      case "openai":
        return ["gpt-4o", "gpt-4-turbo", "o1-preview", "gpt-3.5-turbo"];
      case "anthropic":
        return ["claude-3-5-sonnet", "claude-3-opus", "claude-3-haiku"];
      case "google":
        return ["gemini-1.5-pro", "gemini-1.5-flash"];
      case "mistral":
        return ["mistral-large", "mistral-medium", "codestral"];
      case "meta":
        return ["llama-3.1-405b", "llama-3.1-70b"];
      case "gross":
        return ["gross-v1-optimized"];
      default:
        return ["gpt-4o"];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-slate-900 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="w-6 h-6 text-blue-500" />
            Initialize Sentinel Agent Node
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Provision a new autonomous intelligence unit into the platform
            fabric.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Agent Identity (Name)</Label>
              <Input
                id="name"
                placeholder="e.g. Sales Optimizer V1"
                className="bg-slate-800 border-slate-700"
                value={data.name}
                onChange={e => setData({ ...data, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="environment">Deployment Environment</Label>
              <Select
                value={data.environment}
                onValueChange={v => setData({ ...data, environment: v })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Cpu className="w-3 h-3" /> Framework
              </Label>
              <Select
                value={data.type}
                onValueChange={v => setData({ ...data, type: v })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="langgraph">LangGraph</SelectItem>
                  <SelectItem value="crewai">CrewAI</SelectItem>
                  <SelectItem value="autogen">AutoGen</SelectItem>
                  <SelectItem value="pydanticai">PydanticAI</SelectItem>
                  <SelectItem value="metagpt">MetaGPT</SelectItem>
                  <SelectItem value="langchain">LangChain (Core)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Zap className="w-3 h-3" /> Operational Tier
              </Label>
              <Select
                value={data.tier}
                onValueChange={v => setData({ ...data, tier: v })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="strategic">
                    Strategic (High-Level Plan)
                  </SelectItem>
                  <SelectItem value="tactical">
                    Tactical (Mission Ops)
                  </SelectItem>
                  <SelectItem value="industrial">
                    Industrial (High-Throughput)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Primary LLM Provider</Label>
              <Select
                value={data.provider}
                onValueChange={v =>
                  setData({
                    ...data,
                    provider: v,
                    model: getModelOptions(v)[0],
                  })
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="google">Google Gemini</SelectItem>
                  <SelectItem value="mistral">Mistral AI</SelectItem>
                  <SelectItem value="meta">Meta Llama</SelectItem>
                  <SelectItem value="gross">Gross (Local-Harden)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Base Model Model</Label>
              <Select
                value={data.model}
                onValueChange={v => setData({ ...data, model: v })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {getModelOptions(data.provider).map(m => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Daily Budget Cap ($)</Label>
              <Input
                type="number"
                className="bg-slate-800 border-slate-700"
                value={data.budget}
                onChange={e =>
                  setData({ ...data, budget: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between mb-2">
                <Label>Persistent Memory</Label>
                <Switch
                  checked={data.persistent_memory}
                  onCheckedChange={v =>
                    setData({ ...data, persistent_memory: v })
                  }
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Enable recursive context storage for long-term mission
                coherence.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-3">
              <Label className="flex items-center justify-between">
                <span>Creativity (Temperature)</span>
                <span className="text-blue-400 font-mono text-xs">
                  {data.temperature}
                </span>
              </Label>
              <Slider
                min={0}
                max={1.5}
                step={0.05}
                value={[data.temperature]}
                onValueChange={([v]) => setData({ ...data, temperature: v })}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="bg-slate-800/50 p-4 -mx-6 -mb-6 border-t border-slate-700">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Discard
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white px-8"
            onClick={() => onSave(data)}
          >
            Deploy Node
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WebhookDialog({ open, onOpenChange, onSave }: ModalProps) {
  const [data, setData] = useState({
    name: "",
    url: "",
    events: ["AGENT_ERROR", "BUDGET_EXCEEDED"],
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register Webhook Endpoint</DialogTitle>
          <DialogDescription>
            Configure an external callback for platform events.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Endpoint Name</Label>
            <Input
              value={data.name}
              onChange={e => setData({ ...data, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>URL</Label>
            <Input
              value={data.url}
              onChange={e => setData({ ...data, url: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Events</Label>
            <div className="flex flex-wrap gap-2">
              {[
                "AGENT_ERROR",
                "BUDGET_EXCEEDED",
                "SECURITY_ALERT",
                "SYSTEM_HEALED",
              ].map(ev => (
                <div key={ev} className="flex items-center space-x-2">
                  <Checkbox
                    id={ev}
                    checked={data.events.includes(ev)}
                    onCheckedChange={checked => {
                      if (checked)
                        setData({ ...data, events: [...data.events, ev] });
                      else
                        setData({
                          ...data,
                          events: data.events.filter(e => e !== ev),
                        });
                    }}
                  />
                  <label htmlFor={ev} className="text-xs">
                    {ev}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(data)}>Register Webhook</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

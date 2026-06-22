import { Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const TOGGLE_SETTINGS = [
  {
    key: "autoReply",
    label: "Auto-Reply",
    desc: "Automatically respond to client emails",
  },
  {
    key: "autoInvoice",
    label: "Auto-Invoice",
    desc: "Generate invoices upon project completion",
  },
  {
    key: "smartScheduling",
    label: "Smart Scheduling",
    desc: "Auto-schedule meetings based on availability",
  },
  {
    key: "leadScoring",
    label: "Lead Scoring",
    desc: "AI-powered lead qualification",
  },
];

export function SettingsTab({
  botSettings,
  onSettingsChange,
  onSaveSettings,
}: {
  botSettings: Record<string, string | boolean>;
  onSettingsChange: (settings: Record<string, string | boolean>) => void;
  onSaveSettings: () => void;
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="py-4 border-b border-border/50">
        <CardTitle className="text-caption-premium flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-600" />
          Bot Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {TOGGLE_SETTINGS.map((setting) => (
          <div
            key={setting.key}
            className="flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-sm">{setting.label}</p>
              <p className="text-caption-premium">{setting.desc}</p>
            </div>
            <Switch
              checked={botSettings[setting.key] as boolean}
              onCheckedChange={(checked: boolean) =>
                onSettingsChange({
                  ...botSettings,
                  [setting.key]: checked,
                })
              }
            />
          </div>
        ))}
        <div className="space-y-2">
          <Label className="text-sm">NLP Model</Label>
          <select
            className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm"
            value={String(botSettings.nlpModel)}
            onChange={(e) =>
              onSettingsChange({
                ...botSettings,
                nlpModel: e.target.value,
              })
            }
          >
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5">GPT-3.5 Turbo</option>
            <option value="claude-3">Claude 3</option>
          </select>
        </div>
        <Button
          className="w-full bg-indigo-600"
          onClick={onSaveSettings}
        >
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}

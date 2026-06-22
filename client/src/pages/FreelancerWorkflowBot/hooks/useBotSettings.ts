import { useState, useCallback } from "react";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";

const DEFAULT_SETTINGS: Record<string, string | boolean> = {
  autoReply: true,
  autoInvoice: false,
  smartScheduling: true,
  leadScoring: false,
  nlpModel: "gpt-4",
};

export function useBotSettings() {
  const [botSettings, setBotSettings] = useState<Record<string, string | boolean>>(DEFAULT_SETTINGS);

  const handleSaveBotSettings = useCallback(async () => {
    try {
      const settingsToSave = Object.entries(botSettings).map(
        ([key, value]) => ({
          setting_key: key,
          setting_value: String(value),
          setting_type: typeof value,
          user_id: "current_user",
          description: `${key} setting`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      );

      const savePromises = settingsToSave.map((setting) =>
        extendedApi.workforce.createBotSetting(setting).catch(() => {
          console.log(`Setting ${setting.setting_key} might already exist`);
        })
      );

      await Promise.all(savePromises);
      toast.success("Bot settings saved");
    } catch (error) {
      console.error("Failed to save bot settings:", error);
      toast.error("Failed to save bot settings. Please try again.");
    }
  }, [botSettings]);

  return { botSettings, setBotSettings, handleSaveBotSettings };
}

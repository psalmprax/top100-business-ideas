import { useState, useCallback } from "react";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";
import { storage } from "@/lib/storage";

export function useAgentActions() {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isStripeConnecting, setIsStripeConnecting] = useState(false);
  const [timeSaved, setTimeSaved] = useState(0);

  const handleAuthorizeAgent = useCallback(() => {
    setIsAuthorizing(true);
    toast.promise(extendedApi.workforce.deployCheck(), {
      loading: "Drafting legal authorization and deploying agent...",
      success: (data) => {
        setIsAuthorizing(false);
        setTimeSaved((prev) => {
          const newVal = prev + 14.0;
          storage.set("fwb_time_saved", newVal);
          return newVal;
        });
        const msg =
          data && typeof data === "object" && "message" in data
            ? String((data as Record<string, unknown>).message)
            : undefined;
        return msg || "Agent authorized. CRM automation is now live.";
      },
      error: () => {
        setIsAuthorizing(false);
        return "Authorization failed. Service unavailable.";
      },
    });
  }, []);

  const handleStripeConnect = useCallback(() => {
    setIsStripeConnecting(true);
    toast.promise(
      extendedApi.workforce.billing.createCheckout("starter", "stripe"),
      {
        loading: "Redirecting to Stripe OAuth...",
        success: (data) => {
          setIsStripeConnecting(false);
          const url =
            data && typeof data === "object" && "url" in data
              ? String((data as Record<string, unknown>).url)
              : undefined;
          if (url) {
            window.open(url, "_blank");
          }
          return "Stripe account connected. Billing Bot active.";
        },
        error: () => {
          setIsStripeConnecting(false);
          return "Connection failed. Service unavailable.";
        },
      }
    );
  }, []);

  const handleDelegateTask = useCallback(() => {
    const taskDescription = window.prompt("Describe the task to delegate:");
    if (!taskDescription) return;
    toast.promise(
      extendedApi.workforce.runCampaign(taskDescription, "freelancer"),
      {
        loading: "Delegating task to workflow agent...",
        success: (data) => {
          const msg =
            data && typeof data === "object" && "message" in data
              ? String((data as Record<string, unknown>).message)
              : undefined;
          return (
            msg ||
            `Task delegated: "${taskDescription.substring(0, 40)}..."`
          );
        },
        error: () => "Task delegation failed. Service unavailable.",
      }
    );
  }, []);

  const handleAddClient = useCallback(async () => {
    const name = window.prompt("Client name:");
    if (!name) return;
    const email = window.prompt("Client email:") || "";

    try {
      const newClient = await extendedApi.workforce.createClient({
        name,
        email,
        status: "prospect",
        created_at: new Date().toISOString(),
      });

      // Client list is managed externally, so we return the new client
      return newClient;
    } catch (error) {
      console.error("Failed to add client:", error);
      toast.error("Failed to add client. Please try again.");
      return null;
    }
  }, []);

  const handleAddEvent = useCallback(async () => {
    const title = window.prompt("Event title:");
    if (!title) return;

    const dateStr = window.prompt("Date (e.g., 2026-04-01 10:00):");
    const date = dateStr ? new Date(dateStr) : new Date();

    if (isNaN(date.getTime())) {
      toast.error("Invalid date format");
      return null;
    }

    try {
      const newEvent = await extendedApi.workforce.createScheduleEvent({
        title,
        description: "",
        start_time: date.toISOString(),
        end_time: new Date(date.getTime() + 60 * 60 * 1000).toISOString(),
        event_type: "meeting",
        location: "",
        is_all_day: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return newEvent;
    } catch (error) {
      console.error("Failed to add event:", error);
      toast.error("Failed to add event. Please try again.");
      return null;
    }
  }, []);

  const handleToggleIntegration = useCallback(
    async (
      integrationId: string,
      integrations: { id: string; connected?: boolean }[],
      setIntegrations: React.Dispatch<React.SetStateAction<unknown[]>>
    ) => {
      try {
        const integration = integrations.find((i) => i.id === integrationId);
        if (!integration) return;

        const updatedIntegration =
          await extendedApi.workforce.updateIntegration(integrationId, {
            connected: !integration.connected,
          });

        setIntegrations((prev) =>
          prev.map((i: any) =>
            i.id === integrationId ? updatedIntegration : i
          )
        );
        toast.success(
          `${updatedIntegration.name} ${updatedIntegration.connected ? "connected" : "disconnected"}`
        );
      } catch (error) {
        console.error("Failed to toggle integration:", error);
        toast.error("Failed to toggle integration. Please try again.");
      }
    },
    []
  );

  return {
    isAuthorizing,
    isStripeConnecting,
    timeSaved,
    handleAuthorizeAgent,
    handleStripeConnect,
    handleDelegateTask,
    handleAddClient,
    handleAddEvent,
    handleToggleIntegration,
  };
}

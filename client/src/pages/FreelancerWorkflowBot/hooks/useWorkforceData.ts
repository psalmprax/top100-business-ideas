import { useState, useEffect } from "react";
import {
  extendedApi,
  metricsApi,
  type Agent,
  type Task,
  type Client,
  type Integration,
  type ScheduleEvent,
} from "@/lib/api";

export type InboxMessage = {
  sender?: string;
  category?: string;
  timestamp?: string;
  created_at?: string;
  content?: string;
  message?: string;
  actions?: string[];
};

export type Invoice = {
  id: string;
  invoice_number?: string;
  client_name?: string;
  created_at: string;
  status: string;
  amount?: number;
};

export function useWorkforceData() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [auditLogs, setAuditLogs] = useState<InboxMessage[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [metrics, setMetrics] = useState<Record<string, any> | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [earningsData, setEarningsData] = useState<Record<string, any> | null>(
    null
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [taxEstimate, setTaxEstimate] = useState<Record<string, any> | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          agentsData,
          metricsData,
          tasksData,
          clientsData,
          integrationsData,
          scheduleData,
          insightsData,
          taxDataResp,
          invoicesData,
          inboxData,
        ] = await Promise.all([
          extendedApi.agents.list(),
          metricsApi.current(),
          extendedApi.workforce.getTasks(),
          extendedApi.workforce.getClients(),
          extendedApi.workforce.getIntegrations(),
          extendedApi.workforce.getScheduleEvents(),
          extendedApi.workforce.getInsights(),
          extendedApi.workforce.getTaxEstimate(),
          extendedApi.workforce.getInvoices(),
          extendedApi.workforce.getInboxMessages(),
        ]);

        setAgents(Array.isArray(agentsData) ? agentsData : []);
        if (metricsData) setMetrics(metricsData);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setClients(Array.isArray(clientsData) ? clientsData : []);
        setIntegrations(
          Array.isArray(integrationsData) ? integrationsData : []
        );
        setScheduleEvents(Array.isArray(scheduleData) ? scheduleData : []);
        setEarningsData(insightsData || null);
        setTaxEstimate(taxDataResp || null);
        if (Array.isArray(invoicesData)) setInvoices(invoicesData as Invoice[]);
        if (Array.isArray(inboxData))
          setAuditLogs(inboxData as InboxMessage[]);
      } catch (error) {
        console.error("Failed to fetch workforce bot data:", error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    agents,
    tasks,
    setTasks,
    auditLogs,
    invoices,
    metrics,
    clients,
    setClients,
    integrations,
    setIntegrations,
    scheduleEvents,
    setScheduleEvents,
    earningsData,
    taxEstimate,
  };
}

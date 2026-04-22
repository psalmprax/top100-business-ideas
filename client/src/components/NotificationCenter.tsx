import React, { useState } from "react";
import { Bell, Shield, Info, AlertTriangle, X, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "security" | "info" | "warning" | "success";
  timestamp: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Deepfake Detected",
    message: "High-fidelity biometric mismatch detected in region EU-WEST.",
    type: "security",
    timestamp: "2m ago",
    read: false,
  },
  {
    id: "2",
    title: "SLA Breached",
    message: "Liveness response time exceeded 250ms threshold.",
    type: "warning",
    timestamp: "15m ago",
    read: false,
  },
  {
    id: "3",
    title: "System Update",
    message: "AlphaHecta Core v2.4.1 deployment successful.",
    type: "success",
    timestamp: "1h ago",
    read: true,
  },
  {
    id: "4",
    title: "New Partner Added",
    message: "Global Logistics Corp provisioned a new tenant portal.",
    type: "info",
    timestamp: "3h ago",
    read: true,
  },
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "security":
        return <Shield className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-background">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 mt-2 p-0 bg-slate-950 border-slate-800 shadow-2xl" align="end" forceMount>
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <DropdownMenuLabel className="p-0 font-bold text-sm tracking-tight text-white uppercase">
            Platform Intelligence Alerts
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
            >
              Mark All Read
            </button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          <div className="divide-y divide-white/5">
            {notifications.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground italic text-xs uppercase font-black tracking-widest opacity-20">
                No active threats detected.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 flex gap-3 group relative hover:bg-white/[0.02] transition-colors ${
                    !n.read ? "bg-white/[0.03]" : ""
                  }`}
                >
                  <div className="mt-1 flex-shrink-0">{getTypeIcon(n.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold leading-none ${!n.read ? "text-white" : "text-slate-400"}`}>
                        {n.title}
                      </h4>
                      <span className="text-[9px] font-medium text-slate-500">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-400 line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                  <button
                    onClick={() => removeNotification(n.id)}
                    className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/5 text-slate-500 hover:text-white transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <DropdownMenuSeparator className="bg-white/5" />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 h-8"
          >
            View Full Audit Log
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type InboxMessage } from "../hooks/useWorkforceData";

export function InboxTab({ auditLogs }: { auditLogs: InboxMessage[] }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="py-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-caption-premium flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600" />
            Smart Inbox
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {auditLogs.length} MESSAGES
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {auditLogs.length > 0 ? (
            auditLogs.map((msg: InboxMessage, idx: number) => (
              <div
                key={idx}
                className="flex flex-col p-4 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm font-bold text-indigo-600">
                      {msg.sender || "System"}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[8px] h-3 px-1"
                    >
                      {msg.category || "General"}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground italic">
                    {(msg.timestamp || msg.created_at)
                      ? new Date(
                          msg.timestamp || msg.created_at!
                        ).toLocaleTimeString()
                      : ""}
                  </span>
                </div>
                <p className="text-body-sm text-foreground/90 leading-relaxed">
                  {msg.content || msg.message}
                </p>
                {msg.actions && (
                  <div className="flex gap-2 mt-3">
                    {msg.actions.map((action: string, i: number) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] py-0 px-2"
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Mail className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-body-sm">
                No messages in your smart inbox yet.
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

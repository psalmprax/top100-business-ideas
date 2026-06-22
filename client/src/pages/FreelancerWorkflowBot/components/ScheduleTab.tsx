import { Calendar, Timer, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ScheduleEvent } from "@/lib/api";

export function ScheduleTab({
  scheduleEvents,
  onAddEvent,
}: {
  scheduleEvents: ScheduleEvent[];
  onAddEvent: () => void;
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="py-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-caption-premium flex items-center gap-2">
            <Timer className="w-4 h-4 text-indigo-600" />
            Smart Schedule
          </CardTitle>
          <Button
            size="sm"
            className="bg-indigo-600 h-8 text-[10px] uppercase"
            onClick={onAddEvent}
          >
            <Plus className="w-3 h-3 mr-1" /> Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {scheduleEvents.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-body-sm">
              No events scheduled. Add your first event.
            </p>
          </div>
        ) : (
          scheduleEvents.map((evt: ScheduleEvent) => (
            <div
              key={evt.id}
              className="flex items-center justify-between p-4 border-b border-border/30 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <div className="text-body-sm font-bold">{evt.title}</div>
                  <div className="text-caption-premium">{evt.start_time}</div>
                </div>
              </div>
              <Badge variant="outline" className="text-caption-premium">
                {evt.event_type}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

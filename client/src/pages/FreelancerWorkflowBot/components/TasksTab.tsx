import {
  Briefcase,
  Plus,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Task } from "@/lib/api";

export function TasksTab({
  tasks,
  onCreateTask,
  onCompleteTask,
  onDeleteTask,
}: {
  tasks: Task[];
  onCreateTask: () => void;
  onCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="py-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-caption-premium flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            Task Queue
          </CardTitle>
          <Button
            size="sm"
            className="bg-indigo-600 h-8 text-[10px] uppercase"
            onClick={onCreateTask}
          >
            <Plus className="w-3 h-3 mr-1" /> New Task
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-body-sm">
              No tasks yet. Create your first task.
            </p>
          </div>
        ) : (
          tasks.map((task: Task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 border-b border-border/30 last:border-0 hover:bg-muted/20"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onCompleteTask(task.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.status === "completed" ? "bg-green-500 border-green-500" : "border-muted-foreground hover:border-indigo-500"}`}
                >
                  {task.status === "completed" && (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  )}
                </button>
                <div>
                  <div
                    className={`text-body-sm font-bold ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                  >
                    {task.title}
                  </div>
                  <div className="text-caption-premium">
                    {task.created_at
                      ? new Date(task.created_at).toLocaleDateString()
                      : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-caption-premium"
                >
                  {task.priority}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onDeleteTask(task.id)}
                >
                  <Trash2 className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

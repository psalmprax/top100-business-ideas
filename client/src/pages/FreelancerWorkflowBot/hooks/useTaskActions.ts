import { useCallback } from "react";
import { toast } from "sonner";
import { extendedApi, type Task } from "@/lib/api";

export function useTaskActions(
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) {
  const handleCreateTask = useCallback(async () => {
    const title = window.prompt("Task title:");
    if (!title) return;

    try {
      const newTask = await extendedApi.workforce.createTask({
        title,
        status: "pending",
        priority: "medium",
        assigned_to: "WorkflowBot",
        created_at: new Date().toISOString(),
      });

      setTasks((prev) => [...prev, newTask]);
      toast.success(`Task created: ${title}`);
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task. Please try again.");
    }
  }, [setTasks]);

  const handleCompleteTask = useCallback(
    async (taskId: string) => {
      try {
        const updatedTask = await extendedApi.workforce.updateTask(taskId, {
          status: "completed",
          completed_at: new Date().toISOString(),
        });

        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
        toast.success("Task completed");
      } catch (error) {
        console.error("Failed to complete task:", error);
        toast.error("Failed to complete task. Please try again.");
      }
    },
    [setTasks]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      try {
        await extendedApi.workforce.deleteTask(taskId);

        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        toast.info("Task removed");
      } catch (error) {
        console.error("Failed to delete task:", error);
        toast.error("Failed to delete task. Please try again.");
      }
    },
    [setTasks]
  );

  return { handleCreateTask, handleCompleteTask, handleDeleteTask };
}

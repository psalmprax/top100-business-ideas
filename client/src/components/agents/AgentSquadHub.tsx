import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Terminal,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Search,
  MessageSquare,
  Cpu,
  BrainCircuit,
  X,
} from "lucide-react";
import {
  AgnosticAgentEngine,
  Agent,
  AgentTask,
} from "@/lib/agents/AgnosticAgentEngine";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const AgentSquadHub: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [command, setCommand] = useState("");
  const engine = AgnosticAgentEngine.getInstance();
  const scrollRef = useRef<HTMLDivElement>(null);
  const agentsInitialized = useRef(false);

  useEffect(() => {
    // Initial agents for demo - only register once
    if (!agentsInitialized.current) {
      engine.registerAgent("Alpha-Audit-01", "Auditor");
      engine.registerAgent("Sigma-Compliance-X", "Compliance");
      engine.registerAgent("Logistics-Unit-Prime", "Logistics");
      agentsInitialized.current = true;
    }

    const unsubscribe = engine.subscribe(state => {
      setAgents([...state.agents]);
      setTasks([...state.tasks]);
    });

    return unsubscribe;
  }, []);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    engine.dispatchTask(command);
    setCommand("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "thinking":
        return (
          <BrainCircuit className="w-4 h-4 text-purple-400 animate-pulse" />
        );
      case "acting":
        return <Cpu className="w-4 h-4 text-blue-400 animate-spin" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-slate-900 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-emerald-400"
      >
        <Bot className="w-6 h-6" />
        <AnimatePresence>
          {agents.some(
            a => a.engineStatus === "thinking" || a.engineStatus === "acting"
          ) && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Main Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-0 right-0 h-full w-[400px] z-40 bg-slate-950/80 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                    Agent Squad Hub
                  </h3>
                  <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                    Agnostic Work Engine v1.0
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-slate-500"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Active Agents Section */}
            <div className="p-4 bg-slate-900/30">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Activity className="w-3 h-3" /> Active Squad
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {agents.map(agent => (
                  <div
                    key={agent.id}
                    className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 flex flex-col gap-1"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold text-slate-300 truncate w-24">
                        {agent.name}
                      </span>
                      {getStatusIcon(agent.engineStatus)}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[9px] w-fit py-0 bg-slate-900/50 border-emerald-500/20 text-emerald-400"
                    >
                      {agent.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Log / Tasks */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950/50">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {tasks.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-600 gap-2">
                      <Terminal className="w-8 h-8 opacity-20" />
                      <p className="text-xs italic font-mono">
                        Standby. Awaiting instructions.
                      </p>
                    </div>
                  ) : (
                    tasks.map(task => (
                      <div key={task.id} className="space-y-2">
                        <div className="flex items-start gap-2 group">
                          <ChevronRight className="w-3 h-3 mt-1 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                          <div className="flex-1">
                            <p className="text-sm text-slate-200 leading-tight">
                              <span className="text-emerald-500 font-mono mr-2">
                                GOAL:
                              </span>
                              {task.goal}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge
                                className={cn(
                                  "text-[9px] uppercase",
                                  task.status === "completed"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : task.status === "running"
                                      ? "bg-blue-500/20 text-blue-400 animate-pulse"
                                      : "bg-slate-800 text-slate-400"
                                )}
                              >
                                {task.status}
                              </Badge>
                              {task.status === "completed" && task.result && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Result: {task.result.substring(0, 30)}...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Internal Thought Process for active agent */}
                        {task.status === "running" &&
                          agents
                            .find(a => a.currentTask === task.id)
                            ?.thoughtProcess?.map((thought, idx) => (
                              <motion.div
                                key={`${task.id}-thought-${idx}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="ml-6 pl-2 border-l border-slate-800 text-[10px] text-slate-500 font-mono italic"
                              >
                                &gt; {thought}
                              </motion.div>
                            ))}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Command Console */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/50">
              <form onSubmit={handleDispatch} className="relative">
                <Terminal className="absolute left-3 top-3 w-4 h-4 text-emerald-500/50" />
                <Input
                  value={command}
                  onChange={e => setCommand(e.target.value)}
                  placeholder="Dispatch command to squad..."
                  className="pl-10 pr-12 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-emerald-500/50 ring-offset-slate-950"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 bg-emerald-600 hover:bg-emerald-500"
                  disabled={!command.trim()}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </form>
              <div className="mt-4 flex gap-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-slate-800 text-[9px] transition-colors"
                  onClick={() =>
                    setCommand("Run compliance audit on Project Neo")
                  }
                >
                  Audit Neo
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-slate-800 text-[9px] transition-colors"
                  onClick={() =>
                    setCommand("Analyze market sentiment for AI Act products")
                  }
                >
                  Market Analysis
                </Badge>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

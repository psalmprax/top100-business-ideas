import React, { useState, useEffect } from "react";
import { Search, Command, User, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useLocation } from "wouter";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-all w-64 group"
      >
        <Search className="w-3.5 h-3.5 group-hover:text-primary" />
        <span>Search platform...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-700 bg-slate-950 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="bg-slate-950 border-slate-800 text-white">
          <CommandInput placeholder="Type a command or search term..." className="border-none focus:ring-0" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Global Modules">
              <CommandItem onSelect={() => runCommand(() => setLocation("/deepfake-defense"))}>
                <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />
                <span>Deepfake Defense</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => setLocation("/compliance"))}>
                <Zap className="mr-2 h-4 w-4 text-emerald-500" />
                <span>Compliance Hub</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => setLocation("/workforce"))}>
                <User className="mr-2 h-4 w-4 text-orange-500" />
                <span>Workforce Management</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator className="bg-white/5" />
            <CommandGroup heading="Quick Actions">
              <CommandItem onSelect={() => runCommand(() => console.log("Failover triggered"))}>
                <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                <span>Trigger Global Failover</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => console.log("Report generated"))}>
                <ShieldCheck className="mr-2 h-4 w-4 text-purple-500" />
                <span>Generate Security Audit</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </div>
      </CommandDialog>
    </>
  );
}

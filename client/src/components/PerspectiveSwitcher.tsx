import { LayoutMode } from "@/hooks/useBusinessIdeas";
import { Layers, Shield, Zap, Activity } from "lucide-react";

interface PerspectiveSwitcherProps {
  currentMode: LayoutMode;
  onModeChange: (mode: LayoutMode) => void;
}

export function PerspectiveSwitcher({ currentMode, onModeChange }: PerspectiveSwitcherProps) {
  const modes: { id: LayoutMode; icon: any; label: string; color: string }[] = [
    { id: "alpha", icon: Shield, label: "ALPHA (V1)", color: "#3b82f6" },
    { id: "sigma", icon: Zap, label: "SIGMA (V2)", color: "#A855F7" },
    { id: "omega", icon: Activity, label: "OMEGA (V3)", color: "#00ff00" },
  ];

  return (
    <div className="fixed bottom-10 right-10 z-[60] flex flex-col gap-3">
      <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col gap-1">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
              currentMode === mode.id 
                ? "bg-white/10 text-white" 
                : "text-white/40 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            <mode.icon 
              className="w-4 h-4 transition-transform group-hover:scale-110" 
              style={{ color: currentMode === mode.id ? mode.color : 'inherit' }} 
            />
            <span className="text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
            {currentMode === mode.id && (
               <div className="w-1.5 h-1.5 rounded-full pulse-glow" style={{ backgroundColor: mode.color }} />
            )}
          </button>
        ))}
      </div>
      <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] text-right pr-2">
        _PERSPECTIVE_SWITCHER_
      </div>
    </div>
  );
}

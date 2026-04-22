import { usePerspective, type LayoutPerspective } from "@/contexts/PerspectiveContext";
import { Layers, Shield, Zap, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PerspectiveSwitcher() {
  const { perspective, setPerspective } = usePerspective();
  const modes: { id: LayoutPerspective; icon: any; label: string; color: string }[] = [
    { id: "alpha", icon: Shield, label: "ALPHAHECTA (V1)", color: "#3b82f6" },
    { id: "sigma", icon: Zap, label: "SIGMA (V2)", color: "#A855F7" },
    { id: "omega", icon: Activity, label: "OMEGA (V3)", color: "#00ff00" },
  ];

  return (
    <div className="fixed bottom-10 right-10 z-[60] flex flex-col gap-3">
      <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col gap-1">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setPerspective(mode.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
              perspective === mode.id 
                ? "bg-white/10 text-white" 
                : "text-white/40 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            <mode.icon 
              className="w-4 h-4 transition-transform group-hover:scale-110" 
              style={{ color: perspective === mode.id ? mode.color : 'inherit' }} 
            />
            <span className="text-[10px] font-black uppercase tracking-widest">{mode.label}</span>
            <AnimatePresence>
              {perspective === mode.id && (
                 <motion.div 
                   layoutId="active-perspective"
                   className="w-1.5 h-1.5 rounded-full pulse-glow" 
                   style={{ backgroundColor: mode.color }} 
                 />
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
      <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] text-right pr-2">
        _PERSPECTIVE_SWITCHER_
      </div>
    </div>
  );
}

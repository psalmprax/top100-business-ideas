import { motion } from "framer-motion";
import { Sparkles, Lock } from "lucide-react";

interface PremiumPlaceholderProps {
  title: string;
  description?: string;
  variant?: "coming-soon" | "locked" | "empty";
  className?: string;
}

export function PremiumPlaceholder({
  title,
  description,
  variant = "coming-soon",
  className = "",
}: PremiumPlaceholderProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 ${className}`}
    >
      {/* Background Decorative Element */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary rounded-full blur-[80px] animate-pulse" />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="relative z-10 mb-4"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
          {variant === "coming-soon" && (
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          )}
          {variant === "locked" && (
            <Lock className="w-8 h-8 text-amber-500" />
          )}
          {variant === "empty" && (
            <div className="w-4 h-4 rounded-full bg-primary/20 border border-primary/40" />
          )}
        </div>
      </motion.div>

      <div className="relative z-10">
        <h3 className="text-lg font-black uppercase tracking-widest text-white mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-white/40 max-w-[240px] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {variant === "coming-soon" && (
        <div className="mt-6 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 tracking-[0.2em] uppercase">
          Roadmap Item: Q3 2026
        </div>
      )}
    </div>
  );
}

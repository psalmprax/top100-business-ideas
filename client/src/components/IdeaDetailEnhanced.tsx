import { BusinessIdea, CATEGORY_COLORS, TREND_COLORS } from "@/lib/businessData";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Target, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  BarChart2, 
  Zap, 
  Activity, 
  Globe, 
  Rocket, 
  Layers, 
  Users, 
  AlertTriangle,
  Search,
  MessageSquare,
  Scale
} from "lucide-react";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  ResponsiveContainer 
} from "recharts";

interface IdeaDetailEnhancedProps {
  idea: BusinessIdea;
  onClose: () => void;
}

export function IdeaDetailEnhanced({ idea, onClose }: IdeaDetailEnhancedProps) {
  const catColor = CATEGORY_COLORS[idea.category] || "#6366f1";
  const trendColor = TREND_COLORS[idea.trend];

  const radarData = [
    { subject: "Earning", value: Math.min((idea.earning_potential / 10000000) * 100, 100) },
    { subject: "Speed", value: idea.rollout_speed * 10 },
    { subject: "Margin", value: idea.profit_margin },
    { subject: "Market", value: Math.min((idea.market_size_bn / 500) * 100, 100) },
    { subject: "Scalability", value: idea.rollout_speed * 9 },
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto" style={{ background: "oklch(0.10 0.02 265)", border: "1px solid oklch(0.25 0.04 265)" }}>
        <DialogHeader>
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: catColor + "22", color: catColor, border: `1px solid ${catColor}44`, fontFamily: "'Syne', sans-serif" }}
            >
              #{idea.rank}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: catColor + "18", color: catColor }}>
                  {idea.category}
                </span>
                <span className="text-xs font-bold text-emerald-400">HIGH-POTENTIAL VENTURE</span>
              </div>
              <DialogTitle className="text-white text-2xl leading-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                {idea.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Mission/Description */}
            <div className="p-4 rounded-xl" style={{ background: "oklch(0.14 0.02 265)" }}>
              <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Venture Overview</h4>
              <p className="text-white/70 text-sm leading-relaxed">{idea.description}</p>
            </div>

            {/* Gap Analysis */}
            <div className="p-4 rounded-xl border" style={{ background: "oklch(0.12 0.025 265)", borderColor: trendColor + "33" }}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4" style={{ color: trendColor }} />
                <span className="text-sm font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Market Gap</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{idea.gap}</p>
            </div>

            {/* GTM Strategy */}
            {idea.gtm_strategy && (
              <div className="p-4 rounded-xl border border-blue-500/20" style={{ background: "oklch(0.12 0.04 250 / 0.3)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Go-To-Market Strategy</span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">{idea.gtm_strategy}</p>
              </div>
            )}

            {/* Risk Factors */}
            {idea.risk_factors && (
              <div className="p-4 rounded-xl border border-amber-500/20" style={{ background: "oklch(0.15 0.03 35 / 0.1)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Critical Risks</span>
                </div>
                <ul className="space-y-1.5">
                  {idea.risk_factors.map((risk, i) => (
                    <li key={i} className="text-white/60 text-xs flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Market Signals */}
            {idea.market_signals && (
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Market Demand Signals</h4>
                
                {idea.market_signals.reddit_insight && (
                  <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-[10px] font-bold text-orange-300 uppercase">Reddit Pulse</span>
                    </div>
                    <p className="text-white/70 text-xs italic leading-relaxed">"{idea.market_signals.reddit_insight}"</p>
                  </div>
                )}

                {idea.market_signals.search_trend && (
                  <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Search className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[10px] font-bold text-blue-300 uppercase">Search Trends</span>
                    </div>
                    <p className="text-white/70 text-xs leading-relaxed">{idea.market_signals.search_trend}</p>
                  </div>
                )}

                {idea.market_signals.regulatory_wedge && (
                  <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Scale className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-[10px] font-bold text-purple-300 uppercase">Regulatory Wedge</span>
                    </div>
                    <p className="text-white/70 text-xs leading-relaxed">{idea.market_signals.regulatory_wedge}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <DollarSign className="w-4 h-4" />, label: "Max Revenue Cap", value: idea.earning_label, color: "#f59e0b" },
                { icon: <Clock className="w-4 h-4" />, label: "Time to Pilot", value: idea.rollout_label, color: "#22c55e" },
                { icon: <TrendingUp className="w-4 h-4" />, label: "Profitability", value: `${idea.profit_margin}%`, color: "#3b82f6" },
                { icon: <BarChart2 className="w-4 h-4" />, label: "Market Depth", value: `$${idea.market_size_bn}B`, color: "#a78bfa" },
                { icon: <Zap className="w-4 h-4" />, label: "Capital Needed", value: idea.startup_cost, color: "#fb923c" },
                { icon: <Activity className="w-4 h-4" />, label: "Trend Velocity", value: idea.trend, color: trendColor },
              ].map(({ icon, label, value, color }) => (
                <div key={label} className="p-3 rounded-lg" style={{ background: "oklch(0.15 0.02 265)" }}>
                  <div className="flex items-center gap-1.5 mb-1" style={{ color }}>
                    {icon}
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
                  </div>
                  <div className="text-xs font-bold text-white">{value}</div>
                </div>
              ))}
            </div>

            {/* Tech Stack */}
            {idea.tech_stack && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white/70 uppercase tracking-widest">Recommended Tech Stack</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {idea.tech_stack.map((tech, i) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-1 rounded bg-white/5 border border-white/10 text-white/80">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Team */}
            {idea.team_requirements && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-white/70 uppercase tracking-widest">Ideal Founding Team</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {idea.team_requirements.map((role, i) => (
                    <span key={i} className="text-[10px] font-semibold px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Radar Score */}
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Venture Scorecard</h4>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                  <Radar name="Score" dataKey="value" stroke={catColor} fill={catColor} fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer Markets */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {idea.markets.map(m => (
              <span key={m} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full" style={{ background: "oklch(0.18 0.03 250)", color: "#60a5fa" }}>
                <Globe className="w-3 h-3" />{m}
              </span>
            ))}
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-white/90 transition-all"
          >
            Close Drill-down
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

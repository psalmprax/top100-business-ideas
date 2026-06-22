import React from "react";
import {
  Smartphone,
  ShieldCheck,
  Cpu,
  Zap,
  Globe,
  ArrowLeft,
  ChevronRight,
  Download,
  Terminal,
  Layers,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

const MobileComingSoonPage = () => {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: ShieldCheck,
      title: "Real-time Compliance",
      desc: "Instant push alerts for EU AI Act drift and governance violations.",
    },
    {
      icon: Cpu,
      title: "Agent Control",
      desc: "Provision, pause, and patch your workforce swarms from anywhere.",
    },
    {
      icon: Zap,
      title: "Deepfake Radar",
      desc: "Receive immediate notifications of synthesis attacks on core assets.",
    },
    {
      icon: Layers,
      title: "Multi-Perspective",
      desc: "Switch between Alpha, Sigma, and Omega views on the go.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grain-y.com/assets/images/grain.png')] opacity-[0.03] contrast-150" />
      </div>

      <nav className="container mx-auto px-6 py-8 flex items-center justify-between relative z-10">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setLocation("/")}
        >
          <div className="bg-white/5 p-2 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">
            Back to Dashboard
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-500" />
          <span className="font-bold tracking-tighter text-lg uppercase">
            AlphaHecta <span className="text-indigo-500">Mobile</span>
          </span>
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-12 pb-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 px-3 py-1 mb-6">
              COMING TO TESTFLIGHT Q3 2026
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
              Governance <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                At Your Fingertips
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
              AlphaHecta Mobile brings the full Real-First autonomous
              architecture to your iOS and Android devices. Secure, encrypted,
              and perpetually connected to your corporate cluster.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 px-8 py-7 h-auto rounded-2xl flex items-center gap-3"
              >
                <Smartphone className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-[10px] font-bold uppercase leading-none opacity-60">
                    Coming Soon to
                  </div>
                  <div className="text-lg leading-none">App Store</div>
                </div>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/10 hover:bg-white/5 px-8 py-7 h-auto rounded-2xl flex items-center gap-3"
              >
                <Download className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-[10px] font-bold uppercase leading-none opacity-60">
                    Coming Soon to
                  </div>
                  <div className="text-lg leading-none">Google Play</div>
                </div>
              </Button>
            </div>
          </motion.div>

          {/* Interactive Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {features.map((f, idx) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * idx }}
              >
                <Card className="bg-white/5 border-white/10 hover:border-indigo-500/30 transition-all group overflow-hidden">
                  <CardContent className="p-8 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 w-max mb-6 group-hover:scale-110 transition-transform">
                      <f.icon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                    <p className="text-white/40 leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* System Integrity Section */}
          <motion.div
            className="mt-24 p-8 rounded-3xl bg-gradient-to-br from-indigo-900/30 to-black border border-indigo-500/20 text-left overflow-hidden relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-widest mb-4">
                  <Activity className="w-4 h-4" /> System Health Protected
                </div>
                <h2 className="text-3xl font-black mb-6">
                  Zero-Trust Mobile Core
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2" />
                    <p className="text-sm text-white/50">
                      Military-grade AES-256 encryption for all data-in-transit.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2" />
                    <p className="text-sm text-white/50">
                      Biometric multi-factor authentication for critical
                      platform actions.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2" />
                    <p className="text-sm text-white/50">
                      Deterministic audit trails synced to your primary
                      corporate ledger.
                    </p>
                  </div>
                </div>
                <Button className="mt-8 bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6 group">
                  Learn about Security{" "}
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative">
                  {/* Mock Phone Frame */}
                  <div className="w-64 h-[500px] bg-neutral-900 border-[8px] border-neutral-800 rounded-[48px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-6 bg-neutral-800 flex justify-center">
                      <div className="w-20 h-4 bg-black rounded-b-xl" />
                    </div>
                    <div className="p-4 pt-10 space-y-4">
                      <div className="h-6 w-3/4 bg-white/10 rounded-full animate-pulse" />
                      <div className="h-32 w-full bg-indigo-500/20 rounded-2xl animate-pulse" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
                        <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
                      </div>
                      <div className="space-y-2 pt-4">
                        <div className="h-3 w-full bg-white/5 rounded-full" />
                        <div className="h-3 w-5/6 bg-white/5 rounded-full" />
                        <div className="h-3 w-4/6 bg-white/5 rounded-full" />
                      </div>
                    </div>
                  </div>
                  {/* Decorative floaters */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/20 blur-2xl rounded-full animate-bounce" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 blur-2xl rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>

          <footer className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-white/40" />
              <span className="text-xs text-white/40 font-mono tracking-wider uppercase">
                Global Distribution Layer v4.0
              </span>
            </div>
            <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-white/30">
              <a href="#" className="hover:text-white transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default MobileComingSoonPage;

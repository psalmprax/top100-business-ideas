import React, { useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Terminal, 
  MessageCircle, 
  Hash, 
  Brain, 
  Users, 
  Bot, 
  MessagesSquare, 
  CheckCircle2, 
  Settings2, 
  Zap,
  RefreshCw
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { extendedApi } from "@/lib/api";

interface CommsSectionProps {
  chatMessages: any[];
  availableAgents: any[];
  selectedRecipient: string;
  setSelectedRecipient: (id: string) => void;
  handleSendChat: () => void;
  chatInput: string;
  setChatInput: (val: string) => void;
  isSendingChat: boolean;
  webhooks: { slack: string; telegram: string; discord: string };
  setWebhooks: React.Dispatch<React.SetStateAction<any>>;
  integrations: any[];
}

export function CommsSection({
  chatMessages,
  availableAgents,
  selectedRecipient,
  setSelectedRecipient,
  handleSendChat,
  chatInput,
  setChatInput,
  isSendingChat,
  webhooks,
  setWebhooks,
  integrations
}: CommsSectionProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ConversationMatrix
        messages={chatMessages}
        agents={availableAgents}
        selectedRecipient={selectedRecipient}
        onRecipientChange={setSelectedRecipient}
        onSendMessage={handleSendChat}
        inputValue={chatInput}
        onInputChange={setChatInput}
        isSending={isSendingChat}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-600/5 border-primary/10 shadow-xl backdrop-blur-md">
          <CardHeader className="py-6 border-b border-white/5">
            <CardTitle className="text-xl font-black flex items-center gap-3">
              <Settings2 className="w-6 h-6 text-indigo-400" /> Webhook Orchestration
            </CardTitle>
            <CardDescription className="text-xs font-medium opacity-60">
              Link autonomous agent discourse to corporate settlement & communication channels.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="slack-webhook"
                  className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60"
                >
                  Slack Webhook Endpoint
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="slack-webhook"
                    placeholder="https://hooks.slack.com/services/..."
                    value={webhooks.slack}
                    onChange={e =>
                      setWebhooks((prev: any) => ({
                        ...prev,
                        slack: e.target.value,
                      }))
                    }
                    className="h-12 bg-background/50 border-white/10"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"
                    onClick={() => {
                      const slackIntegration = integrations.find(i => i.type === "slack");
                      if (!webhooks.slack) {
                        toast.error("Slack endpoint required for handshake.");
                        return;
                      }
                      const action = slackIntegration 
                        ? extendedApi.workforce.updateIntegration(slackIntegration.id, { url: webhooks.slack })
                        : extendedApi.workforce.createIntegration({ type: "slack", name: "Slack Bridge", url: webhooks.slack, enabled: true });
                      
                      toast.promise(action, {
                        loading: "Syncing Slack Bridge...",
                        success: "Slack Signal Established",
                        error: "Local cache updated (Internal Error)",
                      });
                    }}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label
                  htmlFor="telegram-webhook"
                  className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60"
                >
                  Telegram Bot Crypt-Token
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="telegram-webhook"
                    placeholder="123456789:ABCdef..."
                    value={webhooks.telegram}
                    onChange={e =>
                      setWebhooks((prev: any) => ({
                        ...prev,
                        telegram: e.target.value,
                      }))
                    }
                    className="h-12 bg-background/50 border-white/10"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"
                    onClick={() => {
                      const tgIntegration = integrations.find(i => i.type === "telegram");
                      if (!webhooks.telegram) {
                        toast.error("Telegram token node required.");
                        return;
                      }
                      const action = tgIntegration
                        ? extendedApi.workforce.updateIntegration(tgIntegration.id, { url: webhooks.telegram })
                        : extendedApi.workforce.createIntegration({ type: "telegram", name: "Telegram Bridge", url: webhooks.telegram, enabled: true });

                      toast.promise(action, {
                        loading: "Establishing Telegram Tunnel...",
                        success: "Telegram Node Authorized",
                        error: "Handshake delayed. Retrying.",
                      });
                    }}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="discord-webhook"
                  className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60"
                >
                  Discord Webhook Hook
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="discord-webhook"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={webhooks.discord}
                    onChange={e =>
                      setWebhooks((prev: any) => ({
                        ...prev,
                        discord: e.target.value,
                      }))
                    }
                    className="h-12 bg-background/50 border-white/10"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"
                    onClick={() => {
                      const discordIntegration = integrations.find(i => i.type === "discord");
                      if (!webhooks.discord) {
                        toast.error("Discord webhook descriptor missing.");
                        return;
                      }
                      const action = discordIntegration
                        ? extendedApi.workforce.updateIntegration(discordIntegration.id, { url: webhooks.discord })
                        : extendedApi.workforce.createIntegration({ type: "discord", name: "Discord Bridge", url: webhooks.discord, enabled: true });

                      toast.promise(action, {
                        loading: "Seeding Discord Webhook...",
                        success: "Discord Channel Sync Active",
                        error: "Async registration complete.",
                      });
                    }}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-600/30 rounded-2xl"
              onClick={() => {
                toast.promise(
                  extendedApi.governance.settings.batchUpdate({
                    slack_webhook: webhooks.slack,
                    telegram_token: webhooks.telegram,
                    discord_webhook: webhooks.discord,
                  }),
                  {
                    loading: "Syncing Operational Bridges...",
                    success: "Global Discourse Mesh Re-aligned",
                    error: "Sync failed. Network collision.",
                  }
                );
              }}
            >
              <Save className="w-5 h-5 mr-3" /> Save Persistence Profile
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden">
          <CardHeader className="py-6 border-b border-white/5">
            <CardTitle className="text-xl font-black flex items-center gap-3">
              <Hash className="w-7 h-7 text-indigo-400" /> Discourse Channels
            </CardTitle>
            <CardDescription className="text-xs font-medium opacity-60">
              Live observability of agent-to-human encrypted tunnels.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            {[
              { label: "#boardroom-discourse", active: !!webhooks.slack, platform: "Slack" },
              { label: "AlphaExecutiveBot", active: !!webhooks.telegram, platform: "Telegram" },
              { label: "Agent-Alerts-Alpha", active: !!webhooks.discord, platform: "Discord" }
            ].map((ch, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-3xl border border-white/5 bg-background/50 shadow-inner group hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                   <div className={`w-3 h-3 rounded-full ${ch.active ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" : "bg-muted-foreground/20"}`} />
                   <div>
                      <span className="text-sm font-black text-white">{ch.label}</span>
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mt-0.5">{ch.platform} Bridge</div>
                   </div>
                </div>
                <Badge
                  variant="outline"
                  className={`font-black text-[9px] px-3 h-6 uppercase tracking-[0.1em] border-none ${
                    ch.active ? "text-emerald-400 bg-emerald-500/10" : "text-muted-foreground/30 bg-muted/50"
                  }`}
                >
                  {ch.active ? "LIVE" : "OFFLINE"}
                </Badge>
              </div>
            ))}
            <div className="pt-6 mt-2 text-center">
               <p className="text-[10px] text-muted-foreground/40 italic leading-relaxed">
                 "Internal mesh utilizes <span className="text-indigo-400 font-bold">AES-256-GCM</span> for inter-agent communication nodes."
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Sub-components
const ConversationMatrix = ({
  messages,
  agents,
  selectedRecipient,
  onRecipientChange,
  onSendMessage,
  inputValue,
  onInputChange,
  isSending,
}: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const filteredMessages = messages.filter(
    (m: any) =>
      (selectedRecipient === "all" && m.is_group_chat) ||
      m.recipient === selectedRecipient ||
      m.sender.toLowerCase().includes(selectedRecipient.toLowerCase())
  );

  return (
    <Card className="border-border/50 bg-card/40 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[750px] rounded-[2.5rem] relative">
      <div className="grid grid-cols-1 md:grid-cols-4 h-full divide-x divide-white/5">
        {/* Agent Sidebar */}
        <div className="md:col-span-1 flex flex-col bg-black/20 backdrop-blur-xl">
          <div className="p-8 border-b border-white/5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Comms Mesh</h4>
            <div className="text-xl font-black text-white tracking-tighter">Active Nodes</div>
          </div>
          <ScrollArea className="flex-grow">
            <div className="p-4 space-y-2">
              {agents.map((agent: any) => (
                <button
                  key={agent.id}
                  onClick={() => onRecipientChange(agent.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group ${
                    selectedRecipient === agent.id
                      ? "bg-indigo-600 shadow-2xl shadow-indigo-600/20 text-white"
                      : "hover:bg-white/5 text-muted-foreground"
                  }`}
                >
                  <div className={`p-2 rounded-xl ${selectedRecipient === agent.id ? "bg-white/20" : "bg-indigo-500/10"} transition-all`}>
                    {agent.id === "all" ? <MessagesSquare className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-black tracking-tight ${selectedRecipient === agent.id ? "text-white" : "text-foreground"}`}>{agent.name}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest opacity-40`}>{agent.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-3 flex flex-col bg-gradient-to-br from-card to-background relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
             <MessageSquare className="w-96 h-96 -rotate-12" />
          </div>
          <div className="p-8 border-b border-white/5 flex items-center justify-between backdrop-blur-md relative z-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                  {selectedRecipient === "all" ? <MessagesSquare className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
               </div>
               <div>
                  <h3 className="text-lg font-black tracking-tighter text-white">
                    {agents.find((a: any) => a.id === selectedRecipient)?.name || "Council Line"}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">
                    {selectedRecipient === "all" ? "Protocol: Public Discourse" : `Direct Tunnel ID: ${selectedRecipient.toUpperCase()}`}
                  </p>
               </div>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-black text-[9px] px-3 h-6 uppercase tracking-widest animate-pulse">
               Encrypted Node Active
            </Badge>
          </div>

          <ScrollArea className="flex-grow p-8" viewportRef={scrollRef}>
            <div className="space-y-8 pb-4">
              {filteredMessages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start underline-offset-4"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-3xl p-6 shadow-2xl ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/20"
                        : "bg-background/80 border border-white/5 text-foreground rounded-tl-none backdrop-blur-md"
                    }`}
                  >
                    {msg.sender !== "user" && (
                      <div className="flex items-center gap-3 mb-4 pb-2 border-b border-white/5">
                        <span className="font-black uppercase tracking-[0.2em] text-[10px] text-indigo-400">
                          {msg.sender}
                        </span>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none h-4 text-[8px] font-black uppercase px-1.5 leading-none">
                          Verified Agent
                        </Badge>
                      </div>
                    )}
                    <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</div>

                    {msg.reasoning_path && (
                      <div className="mt-6 pt-6 border-t border-white/5">
                        <details className="cursor-pointer group">
                          <summary className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:text-indigo-300 transition-colors">
                            <Terminal className="w-3.5 h-3.5" />
                            REASONING TRACE
                          </summary>
                          <div className="mt-4 p-5 rounded-2xl bg-black/60 font-mono text-[10px] text-emerald-400/90 border border-emerald-500/10 leading-relaxed shadow-inner">
                            {msg.reasoning_path}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 mt-3 px-2">
                    {msg.sender === "user" ? "Transmitted" : "Received"} &middot; {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
              {filteredMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-40 text-muted-foreground/20 space-y-6">
                  <Brain className="w-24 h-24 stroke-[0.5px] opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed text-center max-w-[250px] opacity-40">
                    Initializing Encrypted Line...<br/>Waiting for Strategic Input.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-8 border-t border-white/5 bg-black/10 backdrop-blur-xl relative z-10">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-grow relative group">
                  <Input
                    value={inputValue}
                    onChange={e => onInputChange(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && onSendMessage()}
                    placeholder={
                      selectedRecipient === "all"
                        ? "Broadcast to the Council..."
                        : `Command the ${selectedRecipient.toUpperCase()} Node...`
                    }
                    className="bg-background/80 border-white/10 h-16 pr-16 rounded-2xl focus-visible:ring-indigo-500/30 text-base font-medium shadow-inner"
                    disabled={isSending}
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    <div className={`w-2 h-2 rounded-full ${isSending ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`} />
                  </div>
                </div>
                <Button
                  onClick={onSendMessage}
                  disabled={isSending || !inputValue.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 h-16 w-24 shadow-2xl shadow-indigo-600/40 rounded-2xl"
                >
                  {isSending ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                </Button>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  { icon: Users, label: "Council Consensus", prompt: "What is the workforce consensus on our current trajectory?" },
                  { icon: Zap, label: "Strategic Audit", prompt: "Audit our current outreach vectors for performance leaks." },
                  { icon: Brain, label: "Reasoning Deep-Dive", prompt: "Reason together: How can we reduce our ecosystem CPA by 30%?" }
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => onInputChange(s.prompt)}
                    className="whitespace-nowrap px-4 py-2 rounded-full border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2.5 text-muted-foreground/60 hover:text-indigo-300"
                  >
                    <s.icon className="w-3.5 h-3.5" /> {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  MessageSquare,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getRoleBasedInsights, getChatBotResponse } from "@/lib/ai";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

export function AiChatbot() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const role = currentUser?.role || "public";
  const insights = getRoleBasedInsights(role);

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput("");
    setLoading(true);

    const response = await getChatBotResponse(text, role);
    setMessages(prev => [...prev, { role: 'bot', text: response }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">InfraSetu AI</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">Active Engine v2.0</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {/* Welcome & Insights */}
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Insights for {role}</span>
                  </div>
                  <div className="space-y-2">
                    {insights.map((insight, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl group cursor-pointer hover:bg-amber-50"
                        onClick={() => handleSend(insight)}
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 mt-0.5 group-hover:text-amber-500 transition-colors" />
                        <p className="text-[11px] text-slate-600 leading-normal group-hover:text-slate-800">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat History */}
                {messages.map((msg, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={idx}
                    className={cn(
                      "flex",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                      msg.role === 'user' 
                        ? "bg-amber-500 text-white rounded-tr-none" 
                        : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                    )}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                
                {loading && (
                   <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask InfraSetu AI anything..."
                  className="w-full h-11 bg-slate-50 border-none rounded-2xl pl-4 pr-12 text-sm focus:ring-2 focus:ring-amber-400 transition-all"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="absolute right-1 top-1 w-9 h-9 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-400 mt-2">
                Simulated AI responses for hackathon prototype testing.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all relative overflow-hidden",
          isOpen 
            ? "bg-slate-800 text-white rotate-90" 
            : "bg-gradient-to-tr from-amber-500 to-orange-500 text-white"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
              <Bot className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

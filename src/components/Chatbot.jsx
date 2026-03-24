import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

// The list of messages that will cycle
const PROMPTS = [
  "Ask me anything!",
  "Need a design template?",
  "How do I export my work?",
  "Want to see my designs?",
  "I'm here to help! 👋"
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [fade, setFade] = useState(true); // Control fade animation for text swap
  
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey! 👋 I'm your Tripsera assistant. Ask me anything about templates, editing, or exporting!" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // 1. Initial Delay to show the tooltip
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!open) setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [open]);

  // 2. Logic to cycle the text every 4 seconds
  useEffect(() => {
    if (!showTooltip || open) return;

    const interval = setInterval(() => {
      setFade(false); // Start fade out
      
      setTimeout(() => {
        setPromptIndex((prev) => (prev + 1) % PROMPTS.length);
        setFade(true); // Start fade in with new text
      }, 500); // Wait for fade out to finish
      
    }, 4000);

    return () => clearInterval(interval);
  }, [showTooltip, open]);

  useEffect(() => { 
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); 
  }, [messages, isLoading]);

  const handleToggle = () => {
    setOpen((o) => !o);
    setShowTooltip(false);
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    const userMsg = { role: "user", content: text };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    let assistantSoFar = "";
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })) }),
      });
      
      if (!resp.ok || !resp.body) throw new Error("Connection failed");
      
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") { streamDone = true; break; }
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantSoFar += content;
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "assistant") {
                    return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                  }
                  return [...prev, { role: "assistant", content: assistantSoFar }];
                });
              }
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm having trouble connecting right now." }]);
    } finally { setIsLoading(false); }
  }, [input, isLoading, messages]);

  return (
    <>
      {/* Auto-Changing Proactive Pop-up */}
      {showTooltip && !open && (
        <div className="fixed bottom-24 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative bg-white text-slate-800 px-5 py-3 rounded-2xl shadow-2xl border border-purple-100 text-sm font-bold flex items-center gap-3 min-w-[180px]">
            <Sparkles className="w-4 h-4 text-purple-500 animate-pulse shrink-0" />
            
            {/* The Animated Text */}
            <span className={cn(
              "transition-all duration-500 transform",
              fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            )}>
              {PROMPTS[promptIndex]}
            </span>

            {/* Tooltip Arrow */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-purple-100 rotate-45" />
            
            <button 
              onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
              className="ml-1 p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={handleToggle} 
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-purple-200 transition-all duration-500", 
          "bg-gradient-to-br from-purple-600 to-indigo-600 text-white hover:scale-110", 
          open && "rotate-90 scale-95 shadow-none"
        )} 
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-46 group-hover:scale-110" />}
        {!open && !showTooltip && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 border-2 border-white"></span>
            </span>
        )}
      </button>

      {/* Chat Window Container */}
      <div 
        className={cn(
          "fixed bottom-24 right-6 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[2rem] border border-purple-100 bg-white shadow-[0_20px_50px_rgba(147,51,234,0.15)] transition-all duration-500 origin-bottom-right", 
          open ? "scale-100 opacity-100 translate-y-0" : "scale-75 opacity-0 translate-y-12 pointer-events-none"
        )} 
        style={{ height: "min(600px, calc(100vh - 10rem))" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
               <Sparkles className="h-5 w-5 text-purple-100" />
            </div>
            <div>
                <p className="font-bold text-base leading-none">Tripsera AI</p>
                <p className="text-[10px] text-purple-200 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Online
                </p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-slate-50/50">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2", 
                m.role === "user" 
                  ? "bg-purple-600 text-white rounded-br-none" 
                  : "bg-white text-slate-700 border border-purple-50 rounded-bl-none"
              )}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
              <div className="flex justify-start">
                  <div className="bg-white border border-purple-50 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                  </div>
              </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-4 bg-white border-t border-purple-50 flex gap-2 items-center">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type your question..." 
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-400 outline-none transition-all" 
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </>
  );
}
import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Sparkles, Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Pomidor yarpaqları saralır, nə edim?",
  "Bu ay pomidorun qiyməti necədir?",
  "Şəmkirdə üzüm üçün hansı dərmanı tövsiyə edirsən?",
];

// Web Speech API types (browser-only)
type SpeechRecognitionAlt = any;

function getRecognition(): SpeechRecognitionAlt | null {
  if (typeof window === "undefined") return null;
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.lang = "az-AZ";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.continuous = false;
  return rec;
}

function speak(text: string, enabled: boolean) {
  if (!enabled || typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "az-AZ";
  // Try Azerbaijani voice, fallback to Turkish, then default
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find((v) => v.lang.toLowerCase().startsWith("az"))
    ?? voices.find((v) => v.lang.toLowerCase().startsWith("tr"))
    ?? voices[0];
  if (v) u.voice = v;
  u.rate = 1;
  window.speechSynthesis.speak(u);
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Salam! Mən AgroSphere AI köməkçisiyəm 🌱 Bitki, bazar, texnika və ya işçi haqqında soruşa bilərsiniz. Mikrofon düyməsinə basıb səslə də danışa bilərsiniz.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceOut, setVoiceOut] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionAlt | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  useEffect(() => {
    setVoiceSupported(!!getRecognition());
    // Pre-load voices
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const newHistory: Msg[] = [...messages, { role: "user", content }];
    setMessages(newHistory);
    setLoading(true);
    try {
      const payload = newHistory.filter((_, i) => i > 0);
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { messages: payload.length ? payload : [{ role: "user", content }] },
      });
      if (error) throw error;
      const reply = (data as { content?: string; error?: string })?.content
        ?? (data as { error?: string })?.error
        ?? "Cavab alınmadı";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      speak(reply, voiceOut);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Xəta baş verdi";
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const rec = getRecognition();
    if (!rec) {
      setVoiceSupported(false);
      return;
    }
    recognitionRef.current = rec;
    rec.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) {
        setInput(transcript);
        // auto-send
        setTimeout(() => send(transcript), 100);
      }
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => setRecording(false);
    rec.start();
    setRecording(true);
  };

  const toggleVoiceOut = () => {
    const next = !voiceOut;
    setVoiceOut(next);
    if (!next && typeof window !== "undefined") window.speechSynthesis?.cancel();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 lg:bottom-6 right-5 z-40 h-14 w-14 rounded-full grid place-items-center shadow-lg hover:scale-105 transition-transform"
        style={{
          background: "var(--accent-green)",
          color: "var(--accent-green-fg, white)",
          boxShadow: "0 10px 30px -8px color-mix(in oklab, var(--accent-green) 50%, transparent)",
        }}
        aria-label="AI köməkçi"
      >
        <Bot className="h-6 w-6" strokeWidth={2} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40" onClick={() => setOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg h-[85dvh] sm:h-[640px] flex flex-col rounded-t-2xl sm:rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-secondary)] overflow-hidden"
          >
            <header className="flex items-center justify-between px-4 h-14 border-b border-[color:var(--border)] bg-[color:var(--bg-elevated)]">
              <div className="flex items-center gap-2.5">
                <span className="grid place-items-center w-9 h-9 rounded-full bg-[color:var(--accent-green)] text-[color:var(--accent-green-fg,white)]">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[14px] font-semibold leading-tight">AgroSphere AI</p>
                  <p className="text-[11px] text-[color:var(--text-tertiary)]">Aqro köməkçi</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleVoiceOut}
                  title={voiceOut ? "Səsli cavab açıq" : "Səsli cavab bağlı"}
                  className={`grid place-items-center w-9 h-9 rounded-md hover:bg-[color:var(--bg-tertiary)] ${voiceOut ? "text-[color:var(--accent-green)]" : "text-[color:var(--text-secondary)]"}`}
                >
                  {voiceOut ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="grid place-items-center w-9 h-9 rounded-md hover:bg-[color:var(--bg-tertiary)]"
                  aria-label="Bağla"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap"
                    style={
                      m.role === "user"
                        ? { background: "var(--accent-green)", color: "var(--accent-green-fg, white)" }
                        : { background: "var(--bg-tertiary)", color: "var(--text-primary)" }
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-3.5 py-2.5 bg-[color:var(--bg-tertiary)] text-[color:var(--text-secondary)] text-[13px] inline-flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Düşünür...
                  </div>
                </div>
              )}

              {messages.length <= 1 && !loading && (
                <div className="pt-2 flex flex-col gap-1.5">
                  <p className="text-[11px] uppercase tracking-wider text-[color:var(--text-tertiary)] px-1">
                    Təklif olunan suallar
                  </p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-[13px] rounded-lg border border-[color:var(--border-accent)] bg-[color:var(--bg-tertiary)] px-3 py-2 hover:border-[color:var(--accent-green)]/40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="p-3 border-t border-[color:var(--border)] bg-[color:var(--bg-secondary)] flex gap-2 items-center"
            >
              {voiceSupported && (
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`h-11 w-11 grid place-items-center rounded-lg border ${recording ? "bg-[color:var(--accent-red)] text-white border-transparent animate-pulse" : "border-[color:var(--border-accent)] bg-[color:var(--bg-elevated)] text-[color:var(--text-secondary)]"}`}
                  aria-label={recording ? "Yazmağı dayandır" : "Səslə yaz"}
                  title={recording ? "Yazmağı dayandır" : "Səslə yaz (az-AZ)"}
                >
                  {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={recording ? "Dinlənilir..." : "Sualınızı yazın..."}
                className="flex-1 h-11 px-3.5 rounded-lg border border-[color:var(--border-accent)] bg-[color:var(--bg-elevated)] text-[14px] outline-none focus:border-[color:var(--accent-green)]"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-11 w-11 grid place-items-center rounded-lg disabled:opacity-50"
                style={{ background: "var(--accent-green)", color: "var(--accent-green-fg, white)" }}
                aria-label="Göndər"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

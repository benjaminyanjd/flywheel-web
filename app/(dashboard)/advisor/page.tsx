"use client";

import { useRef, useState, useEffect, KeyboardEvent, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useT } from "@/lib/i18n";
import { readSSEStream } from "@/lib/sse";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function AdvisorInner() {
  const { t } = useT();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load conversation history on mount
  useEffect(() => {
    fetch("/api/advisor")
      .then(r => r.json())
      .then(data => {
        if (data.history?.length) setMessages(data.history);
      })
      .catch((err) => console.error("advisor/fetchHistory:", err))
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || streaming) return;

    setInput("");
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);

    const assistantMsg: ChatMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });

      if (res.status === 429) {
        const err = await res.json();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: err.message || t("advisor_rate_limit") };
          return updated;
        });
        setStreaming(false);
        return;
      }
      if (!res.body) return;
      await readSSEStream(res.body, (text) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: text };
          return updated;
        });
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: t("advisor_error"),
          };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 p-6">
      <h1 className="text-xl font-bold text-slate-100 mb-4">{t("advisor_title")}</h1>

      <ScrollArea className="flex-1 mb-4" ref={scrollRef}>
        <div className="space-y-4 pr-4">
          {historyLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
            </div>
          )}
          {!historyLoading && messages.length === 0 && (
            <div className="flex flex-col items-center gap-6 py-12">
              <div className="text-center">
                <p className="text-slate-300 text-lg font-medium mb-1">{t("advisor_welcome")}</p>
                <p className="text-slate-500 text-sm">{t("advisor_welcome_sub")}</p>
              </div>
              {/* 快捷問題 */}
              <div className="flex flex-col gap-2 w-full max-w-md">
                {[
                  t("advisor_quick_q1"),
                  t("advisor_quick_q2"),
                  t("advisor_quick_q3"),
                ].map((q) => (
                  <button
                    key={q}
                    className="text-left text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded-lg px-4 py-3 transition-colors"
                    onClick={() => handleSend(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-blue-50"
                    : "bg-slate-800 text-slate-200 border border-slate-700"
                }`}
              >
                {msg.content}
                {streaming &&
                  i === messages.length - 1 &&
                  msg.role === "assistant" && (
                    <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-0.5" />
                  )}
              </div>
            </div>
          ))}
          {streaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-400">
                <span className="animate-pulse">...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2 items-end">
        <Textarea
          className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none flex-1 min-h-[44px] max-h-[120px]"
          placeholder={t("advisor_placeholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={streaming}
        />
        <Button
          data-send-btn
          className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 h-[44px]"
          onClick={() => handleSend()}
          disabled={streaming || !input.trim()}
        >
          {t("advisor_send")}
        </Button>
      </div>
    </div>
  );
}

export default function AdvisorPage() {
  return (
    <Suspense>
      <AdvisorInner />
    </Suspense>
  );
}

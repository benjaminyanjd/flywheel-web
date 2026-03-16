"use client";

import { useRef, useState, useEffect, KeyboardEvent, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useT } from "@/lib/i18n";
import { readSSEStream } from "@/lib/sse";
import { AdvisorIcon } from "@/components/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PROSE_CLASS } from "@/lib/prose-class";

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

  async function handleClearHistory() {
    setMessages([]);
    try {
      await fetch("/api/advisor", { method: "DELETE" });
    } catch (err) {
      console.error("advisor/clearHistory:", err);
    }
  }

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
    <div className="flex flex-col h-full p-6 animate-page-enter" style={{ backgroundColor: "var(--bg)" }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{t("advisor_title")}</h1>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            disabled={streaming}
            className="rounded-xl btn-press border text-xs hover:bg-[var(--bg-panel)]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            清除對話
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 mb-4" ref={scrollRef}>
        <div className="space-y-4 pr-4">
          {historyLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-t-[var(--signal)] rounded-full animate-spin" style={{ borderColor: "var(--border)" }} />
            </div>
          )}
          {!historyLoading && messages.length === 0 && (
            <div className="flex flex-col items-center gap-6 py-12 animate-page-enter">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" style={{ backgroundColor: "var(--bg-panel)" }}>
                  <AdvisorIcon size={32} style={{ color: "var(--signal)" }} />
                </div>
                <p className="text-lg font-medium mb-1" style={{ color: "var(--text-primary)" }}>{t("advisor_welcome")}</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("advisor_welcome_sub")}</p>
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
                    className="text-left text-sm rounded-xl px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm btn-press border hover:bg-[var(--bg-panel)]" style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
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
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "text-[var(--bg)] whitespace-pre-wrap"
                    : "border"
                }`}
                style={msg.role === "user"
                  ? { backgroundColor: "var(--signal)" }
                  : { backgroundColor: "var(--bg-panel)", color: "var(--text-primary)", borderColor: "var(--border-subtle)" }
                }
              >
                {msg.role === "assistant" ? (
                  <>
                    <div className={PROSE_CLASS}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    {streaming &&
                      i === messages.length - 1 && (
                        <span className="inline-block w-2 h-4 animate-pulse ml-0.5" style={{ backgroundColor: "var(--signal)" }} />
                      )}
                  </>
                ) : (
                  <>
                    {msg.content}
                  </>
                )}
              </div>
            </div>
          ))}
          {streaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex justify-start animate-fade-in">
              <div className="rounded-xl px-4 py-3 text-sm border" style={{ backgroundColor: "var(--bg-panel)", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "var(--text-muted)", animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "var(--text-muted)", animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "var(--text-muted)", animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2 items-end">
        <Textarea
          className="resize-none flex-1 min-h-[44px] max-h-[120px] rounded-xl input-focus-ring focus:outline-none border" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }}
          placeholder={t("advisor_placeholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={streaming}
        />
        <Button
          data-send-btn
          className="shrink-0 h-[44px] rounded-xl btn-press" style={{ backgroundColor: "var(--signal)", color: "var(--bg)" }}
          onClick={() => handleSend()}
          disabled={streaming || !input.trim()}
        >
          {streaming ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : t("advisor_send")}
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

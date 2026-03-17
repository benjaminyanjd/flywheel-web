"use client";

import { useRef, useState, useEffect, useCallback, KeyboardEvent, Suspense } from "react";
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

// IX19: Code block with copy button
function CodeBlock({ className, children }: { className?: string; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const codeText = typeof children === "string" ? children : String(children ?? "");
  const isBlock = !!className;

  if (!isBlock) {
    return (
      <code className="bg-[var(--bg)] px-1.5 py-0.5 rounded text-sm font-mono" style={{ color: "var(--text-primary)" }}>
        {children}
      </code>
    );
  }

  function handleCopy() {
    navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs rounded-md border"
        style={{ backgroundColor: "var(--bg-panel)", borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        {copied ? "✓ 已複製" : "複製"}
      </button>
      <code className={className}>{children}</code>
    </div>
  );
}

function PreBlock({ children }: { children?: React.ReactNode }) {
  return (
    <pre className="relative overflow-auto rounded-xl p-4 my-3 text-sm font-mono" style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
      {children}
    </pre>
  );
}

function AdvisorInner() {
  const { t } = useT();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  // IX18: scroll state
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  // IX20: clear confirm
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // IX18: detect if not at bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const notAtBottom = el.scrollTop + el.clientHeight < el.scrollHeight - 50;
    setShowScrollBottom(notAtBottom);
  }, []);

  function scrollToBottom() {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }

  // IX20: clear confirm handler
  function handleClearHistory() {
    setMessages([]);
    setShowClearConfirm(false);
    try {
      fetch("/api/advisor", { method: "DELETE" });
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

  // IX21: quick questions chips
  const quickQuestions = [
    t("advisor_quick_q1"),
    t("advisor_quick_q2"),
    t("advisor_quick_q3"),
  ];

  return (
    <div className="flex flex-col h-full p-6 animate-page-enter" style={{ backgroundColor: "var(--bg)" }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{t("advisor_title")}</h1>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            disabled={streaming}
            className="rounded-xl btn-press border text-xs hover:bg-[var(--bg-panel)]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            清除對話
          </Button>
        )}
      </div>

      {/* IX18: scroll container with onScroll */}
      <div className="flex-1 mb-4 relative overflow-hidden">
        <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto">
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
                {/* 快捷問題 (empty state - larger) */}
                <div className="flex flex-col gap-2 w-full max-w-md">
                  {quickQuestions.map((q) => (
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
                style={{ marginBottom: "4px" }}
              >
                <div
                  className={`max-w-[80%] text-sm ${
                    msg.role === "user"
                      ? "rounded-2xl rounded-br-md px-4 py-3 whitespace-pre-wrap"
                      : "rounded-2xl rounded-bl-md px-4 py-3 border"
                  }`}
                  style={msg.role === "user"
                    ? { backgroundColor: "color-mix(in srgb, var(--signal) 18%, var(--bg-card))", color: "var(--text-primary)" }
                    : { backgroundColor: "var(--bg-panel)", color: "var(--text-primary)", borderColor: "var(--border-subtle)" }
                  }
                >
                  {msg.role === "assistant" ? (
                    <>
                      <div className={PROSE_CLASS}>
                        {/* IX19: custom code/pre renderers */}
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code: ({ className, children, ...props }) => (
                              <CodeBlock className={className} {...props}>{children}</CodeBlock>
                            ),
                            pre: ({ children }) => (
                              <PreBlock>{children}</PreBlock>
                            ),
                          }}
                        >
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
        </div>

        {/* IX18: scroll-to-bottom floating button */}
        {showScrollBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 animate-fade-in"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            title="回到底部"
          >
            ↓
          </button>
        )}
      </div>

      {/* IX21: Quick question chips (when has history and not streaming) */}
      {messages.length > 0 && !streaming && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="text-xs px-3 py-1 rounded-full border transition-all duration-150 hover:bg-[var(--bg-panel)] btn-press"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)", backgroundColor: "var(--bg-card)" }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

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

      {/* IX20: Clear confirm dialog */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="rounded-2xl p-6 w-80 max-w-[90vw] shadow-xl animate-fade-in"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>確定清除所有對話記錄？</h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>此操作不可撤銷。</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm border transition-colors hover:bg-[var(--bg-panel)]"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                取消
              </button>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: "#ef4444", color: "#fff" }}
              >
                確認清除
              </button>
            </div>
          </div>
        </div>
      )}
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

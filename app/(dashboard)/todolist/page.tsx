"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface TodoItem {
  id: number;
  opp_title: string;
  opp_embed: string;
  created_at: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TodolistPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch("/api/todolist")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTodos(data);
        else if (data.todos) setTodos(data.todos);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleDone(id: number) {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await fetch(`/api/opportunities/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "done" }),
      });
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  }

  function openCancelDialog(id: number) {
    setCancelTarget(id);
    setCancelReason("");
    setCancelDialogOpen(true);
  }

  async function handleCancel() {
    if (cancelTarget === null) return;
    setActionLoading((prev) => ({ ...prev, [cancelTarget]: true }));
    try {
      await fetch(`/api/opportunities/${cancelTarget}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", cancel_reason: cancelReason }),
      });
      setTodos((prev) => prev.filter((t) => t.id !== cancelTarget));
      setCancelDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [cancelTarget!]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <span className="text-slate-400">加载中...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 p-6">
      <h1 className="text-xl font-bold text-slate-100 mb-4">待办清单</h1>

      {todos.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
          <span className="text-4xl mb-3">✅</span>
          <p>没有待办事项</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-3 pr-4">
            {todos.map((todo) => (
              <Card
                key={todo.id}
                className="bg-slate-800 border-slate-700 p-4 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="text-slate-100 font-medium truncate">
                    {todo.opp_title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDate(todo.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-700 text-emerald-400 hover:bg-emerald-900/50"
                    disabled={actionLoading[todo.id]}
                    onClick={() => handleDone(todo.id)}
                  >
                    {actionLoading[todo.id] ? "..." : "✅完成"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-700 text-red-400 hover:bg-red-900/50"
                    disabled={actionLoading[todo.id]}
                    onClick={() => openCancelDialog(todo.id)}
                  >
                    ❌取消
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100">取消原因</DialogTitle>
          </DialogHeader>
          <Textarea
            className="bg-slate-900 border-slate-600 text-slate-100 placeholder:text-slate-500"
            placeholder="请输入取消原因..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300"
              onClick={() => setCancelDialogOpen(false)}
            >
              返回
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCancel}
              disabled={actionLoading[cancelTarget ?? -1]}
            >
              确认取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

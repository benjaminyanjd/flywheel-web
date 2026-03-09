"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ArchiveItem {
  id: number;
  opp_rank: number;
  opp_title: string;
  opp_window: string;
  action: string;
  created_at: string;
}

type StatusFilter = "all" | "todo" | "bias" | "action" | "missed" | "done" | "cancel";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  todo: { label: "待办", className: "bg-blue-600 text-blue-100" },
  bias: { label: "偏见", className: "bg-orange-600 text-orange-100" },
  action: { label: "行动", className: "bg-green-600 text-green-100" },
  missed: { label: "遗漏", className: "bg-gray-600 text-gray-100" },
  done: { label: "完成", className: "bg-emerald-600 text-emerald-100" },
  cancel: { label: "取消", className: "bg-red-600 text-red-100" },
};

const TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "待办" },
  { value: "bias", label: "偏见" },
  { value: "action", label: "行动" },
  { value: "missed", label: "遗漏" },
  { value: "done", label: "完成" },
  { value: "cancel", label: "取消" },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  });
}

export default function ArchivePage() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>("all");

  useEffect(() => {
    fetch("/api/archive")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
        else if (data.items) setItems(data.items);
        else if (data.archive) setItems(data.archive);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.action] = (acc[item.action] || 0) + 1;
    return acc;
  }, {});

  const filtered =
    activeTab === "all" ? items : items.filter((item) => item.action === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <span className="text-slate-400">加载中...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 p-6">
      <h1 className="text-xl font-bold text-slate-100 mb-4">归档记录</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <Badge key={key} className={`${config.className} text-xs`}>
            {config.label}: {statusCounts[key] || 0}
          </Badge>
        ))}
        <Badge className="bg-slate-600 text-slate-100 text-xs">
          总计: {items.length}
        </Badge>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as StatusFilter)}
        className="mb-4"
      >
        <TabsList className="bg-slate-800 border border-slate-700">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead className="text-slate-400 w-16">#</TableHead>
              <TableHead className="text-slate-400">Title</TableHead>
              <TableHead className="text-slate-400 w-24">Status</TableHead>
              <TableHead className="text-slate-400 w-28">Window</TableHead>
              <TableHead className="text-slate-400 w-24">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => {
              const config = STATUS_CONFIG[item.action] || {
                label: item.action,
                className: "bg-slate-600 text-slate-100",
              };
              return (
                <TableRow
                  key={item.id}
                  className="border-slate-700 hover:bg-slate-800/50"
                >
                  <TableCell className="text-slate-500 font-mono text-sm">
                    {item.opp_rank}
                  </TableCell>
                  <TableCell className="text-slate-200">
                    {item.opp_title}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${config.className} text-xs`}>
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {item.opp_window}
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {formatDate(item.created_at)}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-slate-500 py-12"
                >
                  暂无记录
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

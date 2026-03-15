"use client";

import { useRef, useState } from "react";
import { ShareCard } from "./share-card";

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  whyNow: string;
  profitLogic: string;
  confidence: number;
  risks?: string[];
  actions?: string[];
  userInviteCode?: string;
}

export function ShareCardModal({
  isOpen,
  onClose,
  title,
  whyNow,
  profitLogic,
  confidence,
  risks = [],
  actions = [],
  userInviteCode,
}: ShareCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const base64 = dataUrl.split(",")[1];
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "image/png" });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `flywheel-${title.slice(0, 20).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
    } catch {
      // download failed silently; user can retry
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center gap-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-slate-400 text-sm">預覽分享卡片</div>

        {/* Card preview */}
        <div ref={cardRef}>
          <ShareCard
            title={title}
            whyNow={whyNow}
            profitLogic={profitLogic}
            confidence={confidence}
            risks={risks}
            actions={actions}
            userInviteCode={userInviteCode}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {downloading ? "生成中…" : "⬇️ 儲存圖片"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-slate-400 hover:text-slate-200 border border-slate-600 hover:border-slate-400 rounded-lg transition-colors"
          >
            關閉
          </button>
        </div>

        <div className="text-slate-600 text-xs">長按圖片可直接分享到社交媒體</div>
      </div>
    </div>
  );
}

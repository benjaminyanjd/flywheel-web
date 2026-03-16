"use client"
import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"

type ToastType = "success" | "error" | "info"
interface Toast { id: number; message: string; type: ToastType; exiting?: boolean }

const ToastContext = createContext<(msg: string, type?: ToastType) => void>(() => {})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<number, NodeJS.Timeout>>(new Map())

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(t => clearTimeout(t))
    }
  }, [])

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])

    // Start exit animation after 2.8s (total ~3s), then remove after animation completes
    const exitTimer = setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
      const removeTimer = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
        timersRef.current.delete(id)
      }, 200)
      timersRef.current.set(id + 1, removeTimer)
    }, 2800)
    timersRef.current.set(id, exitTimer)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg
              ${t.exiting ? "animate-slide-out-right" : "animate-slide-in-right"}
              ${t.type === "success" ? "bg-green-600 text-white" :
                t.type === "error" ? "bg-red-600 text-white" : "border text-[var(--text-primary)]"}`}
            style={t.type !== "success" && t.type !== "error"
              ? { backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }
              : undefined}
          >
            <span className="flex items-center gap-2">
              {t.type === "success" && <span>✓</span>}
              {t.type === "error" && <span>✕</span>}
              {t.message}
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

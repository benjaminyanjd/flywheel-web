"use client"
import { createContext, useContext, useState, useCallback } from "react"

type ToastType = "success" | "error" | "info"
interface Toast { id: number; message: string; type: ToastType }

const ToastContext = createContext<(msg: string, type?: ToastType) => void>(() => {})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500)
  }, [])
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-lg text-sm font-medium shadow-lg animate-fade-in
            ${t.type === "success" ? "bg-emerald-600 text-white" :
              t.type === "error" ? "bg-red-600 text-white" : "bg-slate-700 text-slate-100"}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

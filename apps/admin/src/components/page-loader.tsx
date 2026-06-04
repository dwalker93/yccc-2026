"use client"

import { useAppGlobal } from "@/providers/app-global-provider"

export default function PageLoader() {
  const [appGlobal, setAppGlobal] = useAppGlobal()

  const { isLoading } = appGlobal

  if (!isLoading) return null

  return (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center
        transition-opacity duration-500 ${
          isLoading ? "opacity-100" : "opacity-0"
        }`}
      onTransitionEnd={() => {
        if (!isLoading) setAppGlobal({ isLoading: false })
      }}
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />

      {/* Spinner only */}
      <div className="relative z-10 h-20 w-20">
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 80 80"
          fill="none"
        >
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-border/40"
          />
        </svg>
        <svg
          className="absolute inset-0 h-full w-full -rotate-90 animate-spin"
          style={{
            animationDuration: "1.2s",
            animationTimingFunction: "linear",
          }}
          viewBox="0 0 80 80"
          fill="none"
        >
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="176"
            strokeDashoffset="132"
            className="text-primary"
          />
        </svg>
      </div>
    </div>
  )
}

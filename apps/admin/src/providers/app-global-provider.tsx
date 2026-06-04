"use client"

import { createContext, use, useState } from "react"

function useAppGlobalState() {
  return useState({
    isLoading: false,
  })
}

const AppGlobalContext = createContext<ReturnType<
  typeof useAppGlobalState
> | null>(null)

export default function AppGlobalProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const appGlobalState = useAppGlobalState()

  return <AppGlobalContext value={appGlobalState}>{children}</AppGlobalContext>
}

export function useAppGlobal() {
  const appGlobal = use(AppGlobalContext)
  if (!appGlobal) {
    throw new Error("useAppGlobal must be used within an AppGlobalProvider")
  }
  return appGlobal
}

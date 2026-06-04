"use client"

import { QueryClientProvider } from "@tanstack/react-query"

import { Toaster } from "@workspace/ui/components/sonner"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

import { getQueryClient } from "@/lib/query-client"

import AppGlobalProvider from "./app-global-provider"
import { DevTools } from "./dev-tools"
import { ThemeProvider } from "./theme-provider"

type Props = {
  children: React.ReactNode
}

const Providers = ({ children }: Props) => {
  const queryClient = getQueryClient()

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <DevTools />
        <AppGlobalProvider>
          <Toaster />
          <TooltipProvider>{children}</TooltipProvider>
        </AppGlobalProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default Providers

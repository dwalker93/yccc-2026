import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "@workspace/ui/globals.css"

import Providers from "@/providers/provider"

import { cn } from "@workspace/ui/lib/utils"

import PageLoader from "@/components/page-loader"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: {
    default: "YCCC Admin",
    template: "%s | YCCC Admin",
  },
  description: "YCCC Admin Dashboard — manage members, events, and content.",
  keywords: ["YCCC", "admin", "dashboard", "management"],
  authors: [{ name: "YCCC" }],
  creator: "YCCL",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "YCCL Admin",
    description: "YCCL Admin Dashboard",
    siteName: "YCCL Admin",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", "font-sans", inter.variable)}
    >
      <body className="relative">
        <Providers>
          <PageLoader />
          {children}
        </Providers>
      </body>
    </html>
  )
}

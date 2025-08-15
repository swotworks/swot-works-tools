import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Swot.works Tools - Professional Business Management Suite",
  description:
    "Comprehensive multi-tool web app for small business bookkeeping, strategy, and financial planning. Privacy-first with offline capabilities.",
  keywords:
    "business tools, bookkeeping, SWOT analysis, cash flow, profit calculator, small business, financial planning",
  authors: [{ name: "Swot.works" }],
  creator: "Swot.works",
  publisher: "Swot.works",
  robots: "index, follow",
  openGraph: {
    title: "Swot.works Tools - Professional Business Management Suite",
    description: "Comprehensive business tools for bookkeeping, strategy, and financial planning",
    type: "website",
    locale: "en_US",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          {children}
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}

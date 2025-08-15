"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Navigation } from "./navigation"

interface PageWrapperProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function PageWrapper({ children, title, description }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
            {description && <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>}
          </motion.div>
        )}
        {children}
      </motion.main>

      {/* Footer */}
      <footer className="bg-muted border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Swot.works — All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

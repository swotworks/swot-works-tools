"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calculator,
  FileText,
  TrendingUp,
  Target,
  BarChart3,
  CreditCard,
  Receipt,
  DollarSign,
  CheckSquare,
  Package,
  Ruler,
  User,
} from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function HomePage() {
  const tools = [
    {
      title: "Daily Entry & Summary",
      description: "Advanced transaction tracking with categories, analytics, and reporting",
      href: "/daily-entry",
      icon: FileText,
      color: "bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900",
    },
    {
      title: "SWOT Creator",
      description: "Strategic business analysis with action planning and insights",
      href: "/swot-creator",
      icon: Target,
      color: "bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900",
    },
    {
      title: "Cash Flow Planner",
      description: "12-month cash flow projections with visual charts and alerts",
      href: "/cash-flow-planner",
      icon: TrendingUp,
      color: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900",
    },
    {
      title: "Profit Calculator",
      description: "Advanced financial analysis with ROI, break-even, and scenarios",
      href: "/profit-calculator",
      icon: Calculator,
      color: "bg-orange-50 hover:bg-orange-100 dark:bg-orange-950 dark:hover:bg-orange-900",
    },
    {
      title: "Break-Even Calculator",
      description: "Calculate break-even points with visual charts and analysis",
      href: "/break-even-calculator",
      icon: BarChart3,
      color: "bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900",
    },
    {
      title: "Loan Repayment Planner",
      description: "Loan calculations with amortization schedules and planning",
      href: "/loan-repayment",
      icon: CreditCard,
      color: "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900",
    },
    {
      title: "Invoice Generator",
      description: "Professional invoices with client management and templates",
      href: "/invoice-generator",
      icon: Receipt,
      color: "bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900",
    },
    {
      title: "Currency Converter",
      description: "Offline currency conversion with rate management",
      href: "/currency-converter",
      icon: DollarSign,
      color: "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950 dark:hover:bg-yellow-900",
    },
    {
      title: "To-Do & Reminder Board",
      description: "Kanban board with priority tags and drag-and-drop",
      href: "/todo-board",
      icon: CheckSquare,
      color: "bg-pink-50 hover:bg-pink-100 dark:bg-pink-950 dark:hover:bg-pink-900",
    },
    {
      title: "Simple Inventory Tracker",
      description: "Product tracking with low-stock alerts and profit margins",
      href: "/inventory-tracker",
      icon: Package,
      color: "bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950 dark:hover:bg-cyan-900",
    },
    {
      title: "Unit Converter",
      description: "Convert length, weight, volume, and area units offline",
      href: "/unit-converter",
      icon: Ruler,
      color: "bg-lime-50 hover:bg-lime-100 dark:bg-lime-950 dark:hover:bg-lime-900",
    },
    {
      title: "Business Card Maker",
      description: "Create professional business cards for print and digital sharing",
      href: "/business-card-maker",
      icon: User,
      color: "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">Professional Business Management Suite</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive toolkit for small business owners. 12 powerful tools for bookkeeping, strategy, financial
            planning, and business operations. Privacy-first with offline capabilities.
          </p>
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {tools.map((tool, index) => {
            const IconComponent = tool.icon
            return (
              <motion.div
                key={tool.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200 h-full">
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full ${tool.color} flex items-center justify-center mb-4 transition-colors`}
                    >
                      <IconComponent className="w-8 h-8 text-foreground" />
                    </div>
                    <CardTitle className="text-lg leading-tight">{tool.title}</CardTitle>
                    <CardDescription className="text-sm">{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <Link href={tool.href}>Open Tool</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-16 bg-muted rounded-lg p-8"
        >
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">Why Choose Swot.works Tools?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">🔒</span>
              </div>
              <h3 className="font-semibold mb-2">Privacy First</h3>
              <p className="text-muted-foreground">
                All data stored locally in your browser. No cloud storage, complete privacy and security.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">📱</span>
              </div>
              <h3 className="font-semibold mb-2">Mobile Friendly</h3>
              <p className="text-muted-foreground">
                Fully responsive design works perfectly on all devices and screen sizes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">📄</span>
              </div>
              <h3 className="font-semibold mb-2">Professional Export</h3>
              <p className="text-muted-foreground">
                Generate professional PDF and JPEG reports with charts, analytics, and branded formatting.
              </p>
            </div>
          </div>
        </motion.div>
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

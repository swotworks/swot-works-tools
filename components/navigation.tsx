"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Menu, X, Sun, Moon, Monitor } from "lucide-react"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface NavigationProps {
  showBackButton?: boolean
}

export function Navigation({ showBackButton = false }: NavigationProps) {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/daily-entry", label: "Daily Entry" },
    { href: "/swot-creator", label: "SWOT Creator" },
    { href: "/cash-flow-planner", label: "Cash Flow" },
    { href: "/profit-calculator", label: "Profit Calc" },
    { href: "/break-even-calculator", label: "Break-Even" },
    { href: "/loan-repayment", label: "Loan Planner" },
    { href: "/invoice-generator", label: "Invoices" },
    { href: "/currency-converter", label: "Currency" },
    { href: "/todo-board", label: "To-Do Board" },
    { href: "/inventory-tracker", label: "Inventory" },
    { href: "/unit-converter", label: "Unit Convert" },
    { href: "/business-card-maker", label: "Bus. Cards" },
  ]

  return (
    <header className="bg-green-600 dark:bg-green-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-white hover:bg-green-700 dark:hover:bg-green-800"
              >
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            )}
            <Link href="/" className="text-2xl font-bold hover:text-green-200 transition-colors">
              Swot.works Tools
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-green-700 dark:hover:bg-green-800">
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Desktop Navigation - Scrollable for many items */}
            <nav className="hidden lg:flex space-x-4 max-w-2xl overflow-x-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap hover:text-green-200 transition-colors px-2 py-1 rounded ${
                    pathname === item.href ? "text-green-200 font-semibold bg-green-700 dark:bg-green-800" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-green-700 dark:hover:bg-green-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-green-500 dark:border-green-600">
            <nav className="py-4 space-y-1 max-h-96 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2 hover:bg-green-700 dark:hover:bg-green-800 transition-colors ${
                    pathname === item.href ? "bg-green-700 dark:bg-green-800 font-semibold" : ""
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

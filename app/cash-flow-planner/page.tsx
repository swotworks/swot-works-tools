"use client"
import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Download,
  Plus,
  Trash2,
  AlertTriangle,
  BarChart3,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface CashFlowEntry {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  category: string
  date: string
  isRecurring: boolean
  recurringFrequency?: "weekly" | "monthly" | "quarterly" | "yearly"
  createdAt: string
}

interface MonthlyProjection {
  month: string
  totalIncome: number
  totalExpenses: number
  netFlow: number
  runningBalance: number
}

const INCOME_CATEGORIES = [
  "Sales Revenue",
  "Service Income",
  "Investment Returns",
  "Rental Income",
  "Grants/Funding",
  "Other Income",
]

const EXPENSE_CATEGORIES = [
  "Rent/Utilities",
  "Salaries/Wages",
  "Marketing",
  "Equipment",
  "Supplies",
  "Insurance",
  "Taxes",
  "Loan Payments",
  "Other Expenses",
]

export default function CashFlowPlannerPage() {
  const [entries, setEntries] = useState<CashFlowEntry[]>([])
  const [projections, setProjections] = useState<MonthlyProjection[]>([])
  const [currentBalance, setCurrentBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
    recurringFrequency: "monthly" as "weekly" | "monthly" | "quarterly" | "yearly",
  })

  // Load data from localStorage on mount
  useEffect(() => {
    loadData()
  }, [])

  // Recalculate projections when entries or balance change
  useEffect(() => {
    calculateProjections()
  }, [entries, currentBalance])

  const loadData = () => {
    try {
      const savedEntries = localStorage.getItem("cashFlowEntries")
      const savedBalance = localStorage.getItem("currentBalance")

      if (savedEntries) {
        setEntries(JSON.parse(savedEntries))
      }
      if (savedBalance) {
        setCurrentBalance(Number.parseFloat(savedBalance))
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setMessage("Error loading saved data")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const saveData = (newEntries: CashFlowEntry[], newBalance?: number) => {
    try {
      localStorage.setItem("cashFlowEntries", JSON.stringify(newEntries))
      if (newBalance !== undefined) {
        localStorage.setItem("currentBalance", newBalance.toString())
      }
    } catch (error) {
      console.error("Error saving data:", error)
      setMessage("Error saving data")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const calculateProjections = () => {
    const now = new Date()
    const projectionMonths = 12
    const monthlyProjections: MonthlyProjection[] = []

    let runningBalance = currentBalance

    for (let i = 0; i < projectionMonths; i++) {
      const projectionDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const monthKey = projectionDate.toISOString().slice(0, 7) // YYYY-MM format

      let monthlyIncome = 0
      let monthlyExpenses = 0

      // Calculate one-time entries for this month
      entries.forEach((entry) => {
        const entryDate = new Date(entry.date)
        const entryMonth = entryDate.toISOString().slice(0, 7)

        if (entryMonth === monthKey) {
          if (entry.type === "income") {
            monthlyIncome += entry.amount
          } else {
            monthlyExpenses += entry.amount
          }
        }
      })

      // Calculate recurring entries
      entries.forEach((entry) => {
        if (!entry.isRecurring) return

        const entryDate = new Date(entry.date)
        const monthsDiff =
          (projectionDate.getFullYear() - entryDate.getFullYear()) * 12 +
          (projectionDate.getMonth() - entryDate.getMonth())

        let shouldInclude = false

        switch (entry.recurringFrequency) {
          case "monthly":
            shouldInclude = monthsDiff >= 0
            break
          case "quarterly":
            shouldInclude = monthsDiff >= 0 && monthsDiff % 3 === 0
            break
          case "yearly":
            shouldInclude = monthsDiff >= 0 && monthsDiff % 12 === 0
            break
          case "weekly":
            // Approximate weekly as 4.33 times per month
            shouldInclude = monthsDiff >= 0
            if (shouldInclude) {
              if (entry.type === "income") {
                monthlyIncome += entry.amount * 4.33
              } else {
                monthlyExpenses += entry.amount * 4.33
              }
              return
            }
            break
        }

        if (shouldInclude && entry.recurringFrequency !== "weekly") {
          if (entry.type === "income") {
            monthlyIncome += entry.amount
          } else {
            monthlyExpenses += entry.amount
          }
        }
      })

      const netFlow = monthlyIncome - monthlyExpenses
      runningBalance += netFlow

      monthlyProjections.push({
        month: projectionDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        totalIncome: monthlyIncome,
        totalExpenses: monthlyExpenses,
        netFlow,
        runningBalance,
      })
    }

    setProjections(monthlyProjections)
  }

  const addEntry = () => {
    if (!formData.amount || !formData.description || !formData.category) {
      setMessage("Please fill in all required fields")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    const newEntry: CashFlowEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: formData.type,
      amount: Number.parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      date: formData.date,
      isRecurring: formData.isRecurring,
      recurringFrequency: formData.isRecurring ? formData.recurringFrequency : undefined,
      createdAt: new Date().toISOString(),
    }

    const updatedEntries = [...entries, newEntry]
    setEntries(updatedEntries)
    saveData(updatedEntries)

    // Reset form
    setFormData({
      type: "income",
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      isRecurring: false,
      recurringFrequency: "monthly",
    })

    setMessage("Cash flow entry added successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const deleteEntry = (id: string) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const updatedEntries = entries.filter((entry) => entry.id !== id)
      setEntries(updatedEntries)
      saveData(updatedEntries)
      setMessage("Entry deleted successfully")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const updateCurrentBalance = (newBalance: number) => {
    setCurrentBalance(newBalance)
    saveData(entries, newBalance)
  }

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all cash flow data? This cannot be undone.")) {
      setEntries([])
      setCurrentBalance(0)
      localStorage.removeItem("cashFlowEntries")
      localStorage.removeItem("currentBalance")
      setMessage("All data cleared successfully")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const downloadPDF = async () => {
    if (projections.length === 0) return

    setIsLoading(true)
    try {
      const jsPDF = (await import("jspdf")).default
      await import("jspdf-autotable")

      const doc = new jsPDF()

      // Header
      doc.setFontSize(20)
      doc.setTextColor(22, 163, 74)
      doc.text("Cash Flow Projection", 20, 25)

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35)
      doc.text(`Current Balance: PKR ${currentBalance.toLocaleString()}`, 20, 45)

      // Summary
      const totalProjectedIncome = projections.reduce((sum, p) => sum + p.totalIncome, 0)
      const totalProjectedExpenses = projections.reduce((sum, p) => sum + p.totalExpenses, 0)
      const finalBalance = projections[projections.length - 1]?.runningBalance || currentBalance

      doc.text(`12-Month Projected Income: PKR ${totalProjectedIncome.toLocaleString()}`, 20, 55)
      doc.text(`12-Month Projected Expenses: PKR ${totalProjectedExpenses.toLocaleString()}`, 20, 65)
      doc.text(`Projected Balance (Year End): PKR ${finalBalance.toLocaleString()}`, 20, 75)

      // Cash Flow Table
      const tableData = projections.map((p) => [
        p.month,
        `PKR ${p.totalIncome.toLocaleString()}`,
        `PKR ${p.totalExpenses.toLocaleString()}`,
        `PKR ${p.netFlow.toLocaleString()}`,
        `PKR ${p.runningBalance.toLocaleString()}`,
      ])
      ;(doc as any).autoTable({
        head: [["Month", "Income", "Expenses", "Net Flow", "Balance"]],
        body: tableData,
        startY: 85,
        theme: "grid",
        headStyles: { fillColor: [22, 163, 74] },
        alternateRowStyles: { fillColor: [249, 250, 251] },
      })

      // Entries section
      let yPos = (doc as any).lastAutoTable.finalY + 20
      doc.setFontSize(16)
      doc.setTextColor(22, 163, 74)
      doc.text("Cash Flow Entries", 20, yPos)

      yPos += 15
      entries.slice(0, 20).forEach((entry, index) => {
        if (yPos > 250) {
          doc.addPage()
          yPos = 30
        }

        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        const typeColor = entry.type === "income" ? [34, 197, 94] : [239, 68, 68]
        doc.setTextColor(...typeColor)
        doc.text(`${entry.type.toUpperCase()}: PKR ${entry.amount.toLocaleString()}`, 20, yPos)

        doc.setTextColor(0, 0, 0)
        doc.text(`${entry.description} (${entry.category})`, 20, yPos + 8)
        doc.text(
          `Date: ${new Date(entry.date).toLocaleDateString()}${entry.isRecurring ? ` - Recurring ${entry.recurringFrequency}` : ""}`,
          20,
          yPos + 16,
        )

        yPos += 25
      })

      // Footer
      doc.setFontSize(10)
      doc.setTextColor(128, 128, 128)
      doc.text("Generated by Swot.works Tools", 20, doc.internal.pageSize.height - 20)

      doc.save(`cash-flow-projection-${new Date().toISOString().split("T")[0]}.pdf`)
      setMessage("PDF downloaded successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      setMessage("Error generating PDF. Please try again.")
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  // Get cash flow alerts
  const getAlerts = () => {
    const alerts = []
    const lowBalanceThreshold = 10000 // PKR 10,000

    projections.forEach((projection, index) => {
      if (projection.runningBalance < 0) {
        alerts.push(
          `Negative balance projected for ${projection.month}: PKR ${projection.runningBalance.toLocaleString()}`,
        )
      } else if (projection.runningBalance < lowBalanceThreshold && index < 3) {
        alerts.push(`Low balance alert for ${projection.month}: PKR ${projection.runningBalance.toLocaleString()}`)
      }
    })

    return alerts
  }

  const alerts = getAlerts()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showBackButton />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cash Flow Planner</h1>
          <p className="text-gray-600">Plan and visualize your business cash flow with 12-month projections</p>
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              <div className="font-medium text-yellow-800 mb-2">Cash Flow Alerts:</div>
              {alerts.map((alert, index) => (
                <div key={index} className="text-yellow-700 text-sm">
                  {alert}
                </div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Balance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>Set your current cash balance to generate accurate projections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="current-balance">Current Balance (PKR)</Label>
                <Input
                  id="current-balance"
                  type="number"
                  value={currentBalance}
                  onChange={(e) => updateCurrentBalance(Number.parseFloat(e.target.value) || 0)}
                  placeholder="Enter current balance"
                  className="mt-2"
                />
              </div>
              <div className="text-2xl font-bold text-green-600">PKR {currentBalance.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        {/* Add Entry Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Cash Flow Entry</CardTitle>
            <CardDescription>Add income or expense entries to build your cash flow projection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "income" | "expense") =>
                    setFormData((prev) => ({ ...prev, type: value, category: "" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount (PKR)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                  rows={2}
                />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isRecurring: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="recurring">Recurring Entry</Label>
              </div>

              {formData.isRecurring && (
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.recurringFrequency}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, recurringFrequency: value }))}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={addEntry} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>

              <Button
                onClick={downloadPDF}
                disabled={isLoading || projections.length === 0}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF Report
              </Button>

              <Button onClick={clearAllData} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 12-Month Projection */}
        {projections.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                12-Month Cash Flow Projection
              </CardTitle>
              <CardDescription>Visual overview of your projected cash flow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="grid grid-cols-12 gap-2 mb-4">
                    {projections.map((projection, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs font-medium text-gray-600 mb-2">{projection.month}</div>
                        <div className="space-y-1">
                          <div
                            className={`h-8 rounded flex items-center justify-center text-xs font-medium ${
                              projection.netFlow >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {projection.netFlow >= 0 ? "+" : ""}
                            {Math.round(projection.netFlow / 1000)}k
                          </div>
                          <div
                            className={`text-xs ${projection.runningBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {Math.round(projection.runningBalance / 1000)}k
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Top: Monthly Net Flow | Bottom: Running Balance (in thousands PKR)
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Total Projected Income</div>
                        <div className="text-xl font-bold text-green-600">
                          PKR {projections.reduce((sum, p) => sum + p.totalIncome, 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <TrendingDown className="w-8 h-8 text-red-500 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Total Projected Expenses</div>
                        <div className="text-xl font-bold text-red-600">
                          PKR {projections.reduce((sum, p) => sum + p.totalExpenses, 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <DollarSign className="w-8 h-8 text-blue-500 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Projected Year-End Balance</div>
                        <div
                          className={`text-xl font-bold ${
                            (projections[projections.length - 1]?.runningBalance || 0) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          PKR {(projections[projections.length - 1]?.runningBalance || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Entries ({entries.length})</CardTitle>
            <CardDescription>Your cash flow entries used for projections</CardDescription>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No entries yet</h3>
                <p className="text-gray-500">Add your first cash flow entry to start planning</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries
                  .slice()
                  .reverse()
                  .slice(0, 10)
                  .map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            entry.type === "income" ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {entry.type === "income" ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{entry.description}</div>
                          <div className="text-sm text-gray-600">
                            {entry.category} • {new Date(entry.date).toLocaleDateString()}
                            {entry.isRecurring && (
                              <Badge variant="secondary" className="ml-2">
                                Recurring {entry.recurringFrequency}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div
                          className={`text-lg font-semibold ${
                            entry.type === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {entry.type === "income" ? "+" : "-"}PKR {entry.amount.toLocaleString()}
                        </div>
                        <Button
                          onClick={() => deleteEntry(entry.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                {entries.length > 10 && (
                  <div className="text-center text-gray-500 text-sm">Showing 10 of {entries.length} entries</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

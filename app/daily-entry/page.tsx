"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Trash2,
  Download,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Edit,
  FileSpreadsheet,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Transaction {
  id: string
  date: string
  type: "income" | "expense"
  amount: number
  description: string
  category: string
  tags: string[]
  paymentMethod: string
  createdAt: string
  updatedAt?: string
}

const INCOME_CATEGORIES = [
  "Sales Revenue",
  "Service Income",
  "Investment Returns",
  "Rental Income",
  "Freelance Work",
  "Grants/Funding",
  "Interest Income",
  "Other Income",
]

const EXPENSE_CATEGORIES = [
  "Office Rent",
  "Utilities",
  "Salaries/Wages",
  "Marketing/Advertising",
  "Equipment/Software",
  "Office Supplies",
  "Travel/Transport",
  "Insurance",
  "Professional Services",
  "Taxes/Fees",
  "Meals/Entertainment",
  "Training/Education",
  "Maintenance/Repairs",
  "Other Expenses",
]

const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "Credit Card",
  "Debit Card",
  "Mobile Payment",
  "Check",
  "Online Payment",
  "Other",
]

export default function DailyEntryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "income" as "income" | "expense",
    amount: "",
    description: "",
    category: "",
    tags: "",
    paymentMethod: "",
  })

  const [filters, setFilters] = useState({
    search: "",
    type: "all" as "all" | "income" | "expense",
    category: "all",
    paymentMethod: "all",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])

  // Load transactions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("swot-daily-transactions")
    if (saved) {
      try {
        const loadedTransactions = JSON.parse(saved)
        const migratedTransactions = loadedTransactions.map((t: any) => ({
          ...t,
          category: t.category || (t.type === "income" ? "Other Income" : "Other Expenses"),
          tags: t.tags || [],
          paymentMethod: t.paymentMethod || "Cash",
        }))
        setTransactions(migratedTransactions)
      } catch (error) {
        console.error("Error loading transactions:", error)
      }
    }
  }, [])

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem("swot-daily-transactions", JSON.stringify(transactions))
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch =
          transaction.description.toLowerCase().includes(searchTerm) ||
          transaction.category.toLowerCase().includes(searchTerm) ||
          transaction.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
          transaction.paymentMethod.toLowerCase().includes(searchTerm)
        if (!matchesSearch) return false
      }

      // Type filter
      if (filters.type !== "all" && transaction.type !== filters.type) return false

      // Category filter
      if (filters.category !== "all" && transaction.category !== filters.category) return false

      // Payment method filter
      if (filters.paymentMethod !== "all" && transaction.paymentMethod !== filters.paymentMethod) return false

      // Date range filter
      if (filters.dateFrom && transaction.date < filters.dateFrom) return false
      if (filters.dateTo && transaction.date > filters.dateTo) return false

      // Amount range filter
      if (filters.minAmount && transaction.amount < Number.parseFloat(filters.minAmount)) return false
      if (filters.maxAmount && transaction.amount > Number.parseFloat(filters.maxAmount)) return false

      return true
    })
  }, [transactions, filters])

  const analytics = useMemo(() => {
    const totalIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    const netBalance = totalIncome - totalExpenses

    // Category breakdown
    const incomeByCategory = INCOME_CATEGORIES.map((cat) => ({
      category: cat,
      amount: filteredTransactions
        .filter((t) => t.type === "income" && t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0),
    })).filter((item) => item.amount > 0)

    const expensesByCategory = EXPENSE_CATEGORIES.map((cat) => ({
      category: cat,
      amount: filteredTransactions
        .filter((t) => t.type === "expense" && t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0),
    })).filter((item) => item.amount > 0)

    // Payment method breakdown
    const paymentMethodBreakdown = PAYMENT_METHODS.map((method) => ({
      method,
      amount: filteredTransactions.filter((t) => t.paymentMethod === method).reduce((sum, t) => sum + t.amount, 0),
      count: filteredTransactions.filter((t) => t.paymentMethod === method).length,
    })).filter((item) => item.amount > 0)

    // Monthly trends (last 12 months)
    const monthlyTrends = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().slice(0, 7)

      const monthTransactions = transactions.filter((t) => t.date.startsWith(monthKey))
      const monthIncome = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
      const monthExpenses = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

      monthlyTrends.push({
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        income: monthIncome,
        expenses: monthExpenses,
        net: monthIncome - monthExpenses,
      })
    }

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      transactionCount: filteredTransactions.length,
      avgTransactionAmount:
        filteredTransactions.length > 0 ? (totalIncome + totalExpenses) / filteredTransactions.length : 0,
      incomeByCategory,
      expensesByCategory,
      paymentMethodBreakdown,
      monthlyTrends,
    }
  }, [filteredTransactions, transactions])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || !formData.description.trim() || !formData.category) {
      setMessage("Please fill in all required fields")
      return
    }

    const amount = Number.parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setMessage("Please enter a valid amount")
      return
    }

    const transactionData = {
      date: formData.date,
      type: formData.type,
      amount,
      description: formData.description.trim(),
      category: formData.category,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      paymentMethod: formData.paymentMethod || "Cash",
      createdAt: new Date().toISOString(),
    }

    if (editingTransaction) {
      // Update existing transaction
      const updatedTransaction = {
        ...editingTransaction,
        ...transactionData,
        updatedAt: new Date().toISOString(),
      }
      setTransactions((prev) => prev.map((t) => (t.id === editingTransaction.id ? updatedTransaction : t)))
      setEditingTransaction(null)
      setMessage("Transaction updated successfully!")
    } else {
      // Create new transaction
      const newTransaction: Transaction = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ...transactionData,
      }
      setTransactions((prev) => [newTransaction, ...prev])
      setMessage("Transaction added successfully!")
    }

    // Reset form
    setFormData({
      date: new Date().toISOString().split("T")[0],
      type: "income",
      amount: "",
      description: "",
      category: "",
      tags: "",
      paymentMethod: "",
    })

    setTimeout(() => setMessage(""), 3000)
  }

  const editTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      date: transaction.date,
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      tags: transaction.tags.join(", "),
      paymentMethod: transaction.paymentMethod,
    })
  }

  const cancelEdit = () => {
    setEditingTransaction(null)
    setFormData({
      date: new Date().toISOString().split("T")[0],
      type: "income",
      amount: "",
      description: "",
      category: "",
      tags: "",
      paymentMethod: "",
    })
  }

  const deleteTransaction = (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setTransactions((prev) => prev.filter((t) => t.id !== id))
      setSelectedTransactions((prev) => prev.filter((selectedId) => selectedId !== id))
      setMessage("Transaction deleted")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const bulkDelete = () => {
    if (selectedTransactions.length === 0) return

    if (window.confirm(`Are you sure you want to delete ${selectedTransactions.length} selected transactions?`)) {
      setTransactions((prev) => prev.filter((t) => !selectedTransactions.includes(t.id)))
      setSelectedTransactions([])
      setMessage(`${selectedTransactions.length} transactions deleted`)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const toggleTransactionSelection = (id: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id],
    )
  }

  const selectAllTransactions = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(filteredTransactions.map((t) => t.id))
    }
  }

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all transaction data? This cannot be undone.")) {
      setTransactions([])
      setSelectedTransactions([])
      localStorage.removeItem("swot-daily-transactions")
      setMessage("All data cleared")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const downloadPDF = async () => {
    setIsLoading(true)
    try {
      const jsPDF = (await import("jspdf")).default
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF()

      // Header
      doc.setFontSize(20)
      doc.setTextColor(22, 163, 74)
      doc.text("Enhanced Transaction Report", 20, 25)

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35)
      doc.text(`Total Transactions: ${analytics.transactionCount}`, 20, 45)

      // Summary
      doc.setFontSize(14)
      doc.text("Financial Summary:", 20, 60)
      doc.setFontSize(12)
      doc.text(`Total Income: PKR ${analytics.totalIncome.toLocaleString()}`, 20, 70)
      doc.text(`Total Expenses: PKR ${analytics.totalExpenses.toLocaleString()}`, 20, 80)
      doc.setTextColor(
        analytics.netBalance >= 0 ? 22 : 220,
        analytics.netBalance >= 0 ? 163 : 38,
        analytics.netBalance >= 0 ? 74 : 38,
      )
      doc.text(`Net Balance: PKR ${analytics.netBalance.toLocaleString()}`, 20, 90)
      doc.setTextColor(0, 0, 0)
      doc.text(`Average Transaction: PKR ${analytics.avgTransactionAmount.toLocaleString()}`, 20, 100)

      // Category breakdown
      let yPos = 115
      if (analytics.incomeByCategory.length > 0) {
        doc.setFontSize(14)
        doc.text("Income by Category:", 20, yPos)
        yPos += 10
        doc.setFontSize(10)
        analytics.incomeByCategory.forEach((item) => {
          doc.text(`• ${item.category}: PKR ${item.amount.toLocaleString()}`, 25, yPos)
          yPos += 8
        })
        yPos += 5
      }

      if (analytics.expensesByCategory.length > 0) {
        doc.setFontSize(14)
        doc.text("Expenses by Category:", 20, yPos)
        yPos += 10
        doc.setFontSize(10)
        analytics.expensesByCategory.forEach((item) => {
          doc.text(`• ${item.category}: PKR ${item.amount.toLocaleString()}`, 25, yPos)
          yPos += 8
        })
        yPos += 10
      }

      // Transactions table
      if (yPos > 200) {
        doc.addPage()
        yPos = 30
      }

      const tableData = filteredTransactions
        .slice(0, 50)
        .map((t) => [
          new Date(t.date).toLocaleDateString(),
          t.type.charAt(0).toUpperCase() + t.type.slice(1),
          t.category,
          `PKR ${t.amount.toLocaleString()}`,
          t.description.substring(0, 30) + (t.description.length > 30 ? "..." : ""),
          t.paymentMethod,
        ])

      autoTable(doc, {
        head: [["Date", "Type", "Category", "Amount", "Description", "Payment"]],
        body: tableData,
        startY: yPos,
        headStyles: { fillColor: [22, 163, 74] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 8 },
      })

      // Footer
      const pageHeight = doc.internal.pageSize.height
      doc.setFontSize(10)
      doc.setTextColor(128, 128, 128)
      doc.text("Generated by Swot.works Tools", 20, pageHeight - 20)

      doc.save(`enhanced-transaction-report-${new Date().toISOString().split("T")[0]}.pdf`)
      setMessage("Enhanced PDF report downloaded successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      setMessage("Error generating PDF. Please try again.")
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const downloadCSV = () => {
    const headers = ["Date", "Type", "Category", "Amount", "Description", "Tags", "Payment Method", "Created At"]
    const csvData = [
      headers,
      ...filteredTransactions.map((t) => [
        t.date,
        t.type,
        t.category,
        t.amount.toString(),
        t.description,
        t.tags.join("; "),
        t.paymentMethod,
        new Date(t.createdAt).toLocaleString(),
      ]),
    ]

    const csvContent = csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    setMessage("CSV file downloaded successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showBackButton />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Daily Entry & Summary</h1>
          <p className="text-gray-600">
            Advanced transaction tracking with analytics, categories, and powerful filtering
          </p>
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Entry Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{editingTransaction ? "Edit Transaction" : "Add Transaction"}</CardTitle>
                <CardDescription>
                  {editingTransaction ? "Update transaction details" : "Enter your income or expense details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Transaction Type</Label>
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
                    <Label htmlFor="category">Category *</Label>
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
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter transaction description..."
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., urgent, recurring, client-work"
                      value={formData.tags}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                      {editingTransaction ? (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Update Transaction
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Transaction
                        </>
                      )}
                    </Button>
                    {editingTransaction && (
                      <Button type="button" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Enhanced Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Total Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">PKR {analytics.totalIncome.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Total Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">PKR {analytics.totalExpenses.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Net Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${analytics.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    PKR {analytics.netBalance.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    PKR {Math.round(analytics.avgTransactionAmount).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Search & Filter</CardTitle>
                    <CardDescription>Find and filter your transactions</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="w-4 h-4 mr-2" />
                    {showFilters ? "Hide Filters" : "Show Filters"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions, categories, tags..."
                      value={filters.search}
                      onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t">
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={filters.type}
                          onValueChange={(value: any) => setFilters((prev) => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="income">Income Only</SelectItem>
                            <SelectItem value="expense">Expenses Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Category</Label>
                        <Select
                          value={filters.category}
                          onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Payment Method</Label>
                        <Select
                          value={filters.paymentMethod}
                          onValueChange={(value) => setFilters((prev) => ({ ...prev, paymentMethod: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Methods</SelectItem>
                            {PAYMENT_METHODS.map((method) => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Date From</Label>
                        <Input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label>Date To</Label>
                        <Input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label>Min Amount</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={filters.minAmount}
                          onChange={(e) => setFilters((prev) => ({ ...prev, minAmount: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label>Max Amount</Label>
                        <Input
                          type="number"
                          placeholder="No limit"
                          value={filters.maxAmount}
                          onChange={(e) => setFilters((prev) => ({ ...prev, maxAmount: e.target.value }))}
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          onClick={() =>
                            setFilters({
                              search: "",
                              type: "all",
                              category: "all",
                              paymentMethod: "all",
                              dateFrom: "",
                              dateTo: "",
                              minAmount: "",
                              maxAmount: "",
                            })
                          }
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={downloadPDF}
                disabled={isLoading || filteredTransactions.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                {isLoading ? "Generating PDF..." : "Download PDF Report"}
              </Button>

              <Button
                onClick={downloadCSV}
                disabled={filteredTransactions.length === 0}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export CSV
              </Button>

              {selectedTransactions.length > 0 && (
                <Button onClick={bulkDelete} variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedTransactions.length})
                </Button>
              )}

              <Button onClick={clearAllData} variant="destructive" disabled={transactions.length === 0}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>

            {/* Enhanced Transactions Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Transactions</CardTitle>
                    <CardDescription>
                      Showing {filteredTransactions.length} of {transactions.length} transactions
                    </CardDescription>
                  </div>
                  {filteredTransactions.length > 0 && (
                    <Button variant="outline" size="sm" onClick={selectAllTransactions}>
                      {selectedTransactions.length === filteredTransactions.length ? "Deselect All" : "Select All"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {transactions.length === 0
                      ? "No transactions recorded yet. Add your first transaction to get started."
                      : "No transactions match your current filters. Try adjusting your search criteria."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <input
                              type="checkbox"
                              checked={selectedTransactions.length === filteredTransactions.length}
                              onChange={selectAllTransactions}
                              className="rounded border-gray-300"
                            />
                          </TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Tags</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedTransactions.includes(transaction.id)}
                                onChange={() => toggleTransactionSelection(transaction.id)}
                                className="rounded border-gray-300"
                              />
                            </TableCell>
                            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge
                                variant={transaction.type === "income" ? "default" : "destructive"}
                                className={
                                  transaction.type === "income"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }
                              >
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{transaction.category}</span>
                            </TableCell>
                            <TableCell className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                              <span className="font-medium">PKR {transaction.amount.toLocaleString()}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm" title={transaction.description}>
                                {transaction.description.length > 30
                                  ? transaction.description.substring(0, 30) + "..."
                                  : transaction.description}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {transaction.paymentMethod}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {transaction.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {transaction.tags.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{transaction.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => editTransaction(transaction)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteTransaction(transaction.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {analytics.incomeByCategory.length > 0 || analytics.expensesByCategory.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income Categories */}
                {analytics.incomeByCategory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PieChart className="w-5 h-5 mr-2" />
                        Income by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.incomeByCategory.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.category}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${(item.amount / analytics.totalIncome) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-green-600 min-w-[80px] text-right">
                                PKR {item.amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Expense Categories */}
                {analytics.expensesByCategory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Expenses by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.expensesByCategory.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.category}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-red-500 h-2 rounded-full"
                                  style={{ width: `${(item.amount / analytics.totalExpenses) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-red-600 min-w-[80px] text-right">
                                PKR {item.amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}

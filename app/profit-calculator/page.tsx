"use client"

import { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  Download,
  Trash2,
  TrendingUp,
  Plus,
  Target,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  Copy,
  AlertCircle,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProfitCalculation {
  id: string
  productName: string
  costPrice: number
  sellingPrice: number
  quantity: number
  fixedCosts: number
  variableCosts: number
  profitPerUnit: number
  totalProfit: number
  profitMargin: number
  grossMargin: number
  markup: number
  roi: number
  breakEvenUnits: number
  breakEvenRevenue: number
  calculatedAt: string
  category: string
  notes: string
}

interface ScenarioAnalysis {
  id: string
  name: string
  baseCalculation: ProfitCalculation
  scenarios: {
    name: string
    costPriceChange: number
    sellingPriceChange: number
    quantityChange: number
    result: ProfitCalculation
  }[]
  createdAt: string
}

const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Food & Beverage",
  "Services",
  "Software",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Other",
]

export default function ProfitCalculatorPage() {
  const [activeTab, setActiveTab] = useState("calculator")
  const [calculations, setCalculations] = useState<ProfitCalculation[]>([])
  const [scenarios, setScenarios] = useState<ScenarioAnalysis[]>([])
  const [currentCalculation, setCurrentCalculation] = useState<ProfitCalculation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const chartRef = useRef<HTMLCanvasElement>(null)
  const trendChartRef = useRef<HTMLCanvasElement>(null)

  // Form states
  const [formData, setFormData] = useState({
    productName: "",
    costPrice: "",
    sellingPrice: "",
    quantity: "",
    fixedCosts: "",
    variableCosts: "",
    category: "Other",
    notes: "",
  })

  const [bulkData, setBulkData] = useState("")
  const [scenarioForm, setScenarioForm] = useState({
    name: "",
    baseCalculationId: "",
    scenarios: [
      { name: "Optimistic", costPriceChange: -10, sellingPriceChange: 5, quantityChange: 20 },
      { name: "Pessimistic", costPriceChange: 10, sellingPriceChange: -5, quantityChange: -20 },
      { name: "Realistic", costPriceChange: 0, sellingPriceChange: 0, quantityChange: 0 },
    ],
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCalculations = localStorage.getItem("swot-profit-calculations")
    const savedScenarios = localStorage.getItem("swot-profit-scenarios")

    if (savedCalculations) {
      try {
        const loadedCalculations = JSON.parse(savedCalculations)
        // Migrate old calculations to new format
        const migratedCalculations = loadedCalculations.map((calc: any) => ({
          ...calc,
          fixedCosts: calc.fixedCosts || 0,
          variableCosts: calc.variableCosts || 0,
          grossMargin: calc.grossMargin || ((calc.sellingPrice - calc.costPrice) / calc.sellingPrice) * 100,
          markup: calc.markup || ((calc.sellingPrice - calc.costPrice) / calc.costPrice) * 100,
          roi: calc.roi || (calc.totalProfit / (calc.costPrice * calc.quantity)) * 100,
          breakEvenUnits: calc.breakEvenUnits || 0,
          breakEvenRevenue: calc.breakEvenRevenue || 0,
          category: calc.category || "Other",
          notes: calc.notes || "",
        }))
        setCalculations(migratedCalculations)
      } catch (error) {
        console.error("Error loading calculations:", error)
      }
    }

    if (savedScenarios) {
      try {
        setScenarios(JSON.parse(savedScenarios))
      } catch (error) {
        console.error("Error loading scenarios:", error)
      }
    }
  }, [])

  // Save data whenever calculations or scenarios change
  useEffect(() => {
    if (calculations.length > 0) {
      localStorage.setItem("swot-profit-calculations", JSON.stringify(calculations))
    }
  }, [calculations])

  useEffect(() => {
    if (scenarios.length > 0) {
      localStorage.setItem("swot-profit-scenarios", JSON.stringify(scenarios))
    }
  }, [scenarios])

  // Real-time calculation whenever form data changes
  useEffect(() => {
    const costPrice = Number.parseFloat(formData.costPrice) || 0
    const sellingPrice = Number.parseFloat(formData.sellingPrice) || 0
    const quantity = Number.parseFloat(formData.quantity) || 0
    const fixedCosts = Number.parseFloat(formData.fixedCosts) || 0
    const variableCosts = Number.parseFloat(formData.variableCosts) || 0

    if (costPrice > 0 && sellingPrice > 0 && quantity > 0) {
      const totalCostPrice = costPrice + variableCosts
      const profitPerUnit = sellingPrice - totalCostPrice
      const totalProfit = profitPerUnit * quantity - fixedCosts
      const profitMargin = (profitPerUnit / sellingPrice) * 100
      const grossMargin = ((sellingPrice - totalCostPrice) / sellingPrice) * 100
      const markup = ((sellingPrice - totalCostPrice) / totalCostPrice) * 100
      const totalInvestment = totalCostPrice * quantity + fixedCosts
      const roi = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0

      // Break-even analysis
      const contributionMargin = sellingPrice - totalCostPrice
      const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0
      const breakEvenRevenue = breakEvenUnits * sellingPrice

      setCurrentCalculation({
        id: "",
        productName: formData.productName || "Unnamed Product",
        costPrice: totalCostPrice,
        sellingPrice,
        quantity,
        fixedCosts,
        variableCosts,
        profitPerUnit,
        totalProfit,
        profitMargin,
        grossMargin,
        markup,
        roi,
        breakEvenUnits,
        breakEvenRevenue,
        calculatedAt: "",
        category: formData.category,
        notes: formData.notes,
      })
    } else {
      setCurrentCalculation(null)
    }
  }, [formData])

  // Update charts whenever current calculation changes
  useEffect(() => {
    if (currentCalculation && chartRef.current) {
      updateProfitChart()
    }
    if (calculations.length > 0 && trendChartRef.current) {
      updateTrendChart()
    }
  }, [currentCalculation, calculations])

  const updateProfitChart = async () => {
    if (!currentCalculation || !chartRef.current) return

    try {
      const Chart = (await import("chart.js/auto")).default

      const ctx = chartRef.current.getContext("2d")
      if (!ctx) return

      Chart.getChart(chartRef.current)?.destroy()

      const totalCosts = currentCalculation.costPrice * currentCalculation.quantity + currentCalculation.fixedCosts
      const revenue = currentCalculation.sellingPrice * currentCalculation.quantity

      new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Total Costs", "Profit", "Fixed Costs"],
          datasets: [
            {
              data: [
                currentCalculation.costPrice * currentCalculation.quantity,
                Math.max(0, currentCalculation.totalProfit),
                currentCalculation.fixedCosts,
              ],
              backgroundColor: ["#ef4444", "#16a34a", "#f59e0b"],
              borderColor: ["#dc2626", "#15803d", "#d97706"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
            title: {
              display: true,
              text: `Revenue Breakdown - PKR ${revenue.toLocaleString()}`,
            },
          },
        },
      })
    } catch (error) {
      console.error("Error creating profit chart:", error)
    }
  }

  const updateTrendChart = async () => {
    if (calculations.length === 0 || !trendChartRef.current) return

    try {
      const Chart = (await import("chart.js/auto")).default

      const ctx = trendChartRef.current.getContext("2d")
      if (!ctx) return

      Chart.getChart(trendChartRef.current)?.destroy()

      const last12Calculations = calculations.slice(0, 12).reverse()
      const labels = last12Calculations.map((calc) => new Date(calc.calculatedAt).toLocaleDateString())
      const profits = last12Calculations.map((calc) => calc.totalProfit)
      const margins = last12Calculations.map((calc) => calc.profitMargin)

      new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Total Profit (PKR)",
              data: profits,
              borderColor: "#16a34a",
              backgroundColor: "rgba(22, 163, 74, 0.1)",
              yAxisID: "y",
            },
            {
              label: "Profit Margin (%)",
              data: margins,
              borderColor: "#2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.1)",
              yAxisID: "y1",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: "Calculations",
              },
            },
            y: {
              type: "linear",
              display: true,
              position: "left",
              title: {
                display: true,
                text: "Profit (PKR)",
              },
            },
            y1: {
              type: "linear",
              display: true,
              position: "right",
              title: {
                display: true,
                text: "Margin (%)",
              },
              grid: {
                drawOnChartArea: false,
              },
            },
          },
          plugins: {
            title: {
              display: true,
              text: "Profit Trends (Last 12 Calculations)",
            },
          },
        },
      })
    } catch (error) {
      console.error("Error creating trend chart:", error)
    }
  }

  const saveCalculation = () => {
    if (!currentCalculation) {
      setMessage("Please enter valid values to save calculation")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    const newCalculation: ProfitCalculation = {
      ...currentCalculation,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      calculatedAt: new Date().toISOString(),
    }

    setCalculations((prev) => [newCalculation, ...prev])
    setFormData({
      productName: "",
      costPrice: "",
      sellingPrice: "",
      quantity: "",
      fixedCosts: "",
      variableCosts: "",
      category: "Other",
      notes: "",
    })
    setMessage("Calculation saved successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const processBulkCalculations = () => {
    if (!bulkData.trim()) {
      setMessage("Please enter bulk calculation data")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    try {
      const lines = bulkData.trim().split("\n")
      const newCalculations: ProfitCalculation[] = []

      lines.forEach((line, index) => {
        const parts = line.split(",").map((part) => part.trim())
        if (parts.length >= 4) {
          const [productName, costPrice, sellingPrice, quantity, fixedCosts = "0", variableCosts = "0"] = parts

          const cost = Number.parseFloat(costPrice)
          const selling = Number.parseFloat(sellingPrice)
          const qty = Number.parseFloat(quantity)
          const fixed = Number.parseFloat(fixedCosts)
          const variable = Number.parseFloat(variableCosts)

          if (!isNaN(cost) && !isNaN(selling) && !isNaN(qty) && cost > 0 && selling > 0 && qty > 0) {
            const totalCostPrice = cost + variable
            const profitPerUnit = selling - totalCostPrice
            const totalProfit = profitPerUnit * qty - fixed
            const profitMargin = (profitPerUnit / selling) * 100
            const grossMargin = ((selling - totalCostPrice) / selling) * 100
            const markup = ((selling - totalCostPrice) / totalCostPrice) * 100
            const totalInvestment = totalCostPrice * qty + fixed
            const roi = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0

            const contributionMargin = selling - totalCostPrice
            const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixed / contributionMargin) : 0
            const breakEvenRevenue = breakEvenUnits * selling

            newCalculations.push({
              id: (Date.now() + index).toString() + Math.random().toString(36).substr(2, 9),
              productName: productName || `Product ${index + 1}`,
              costPrice: totalCostPrice,
              sellingPrice: selling,
              quantity: qty,
              fixedCosts: fixed,
              variableCosts: variable,
              profitPerUnit,
              totalProfit,
              profitMargin,
              grossMargin,
              markup,
              roi,
              breakEvenUnits,
              breakEvenRevenue,
              calculatedAt: new Date().toISOString(),
              category: "Other",
              notes: "",
            })
          }
        }
      })

      if (newCalculations.length > 0) {
        setCalculations((prev) => [...newCalculations, ...prev])
        setBulkData("")
        setMessage(`${newCalculations.length} calculations processed successfully!`)
      } else {
        setMessage("No valid calculations found in the data")
      }
    } catch (error) {
      console.error("Error processing bulk data:", error)
      setMessage("Error processing bulk data. Please check the format.")
    }
    setTimeout(() => setMessage(""), 3000)
  }

  const createScenarioAnalysis = () => {
    const baseCalc = calculations.find((calc) => calc.id === scenarioForm.baseCalculationId)
    if (!baseCalc) {
      setMessage("Please select a base calculation for scenario analysis")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    const scenarioResults = scenarioForm.scenarios.map((scenario) => {
      const newCostPrice = baseCalc.costPrice * (1 + scenario.costPriceChange / 100)
      const newSellingPrice = baseCalc.sellingPrice * (1 + scenario.sellingPriceChange / 100)
      const newQuantity = baseCalc.quantity * (1 + scenario.quantityChange / 100)

      const profitPerUnit = newSellingPrice - newCostPrice
      const totalProfit = profitPerUnit * newQuantity - baseCalc.fixedCosts
      const profitMargin = (profitPerUnit / newSellingPrice) * 100
      const grossMargin = ((newSellingPrice - newCostPrice) / newSellingPrice) * 100
      const markup = ((newSellingPrice - newCostPrice) / newCostPrice) * 100
      const totalInvestment = newCostPrice * newQuantity + baseCalc.fixedCosts
      const roi = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0

      const contributionMargin = newSellingPrice - newCostPrice
      const breakEvenUnits = contributionMargin > 0 ? Math.ceil(baseCalc.fixedCosts / contributionMargin) : 0
      const breakEvenRevenue = breakEvenUnits * newSellingPrice

      return {
        name: scenario.name,
        costPriceChange: scenario.costPriceChange,
        sellingPriceChange: scenario.sellingPriceChange,
        quantityChange: scenario.quantityChange,
        result: {
          ...baseCalc,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          costPrice: newCostPrice,
          sellingPrice: newSellingPrice,
          quantity: newQuantity,
          profitPerUnit,
          totalProfit,
          profitMargin,
          grossMargin,
          markup,
          roi,
          breakEvenUnits,
          breakEvenRevenue,
          calculatedAt: new Date().toISOString(),
        },
      }
    })

    const newScenario: ScenarioAnalysis = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: scenarioForm.name || `Scenario Analysis ${scenarios.length + 1}`,
      baseCalculation: baseCalc,
      scenarios: scenarioResults,
      createdAt: new Date().toISOString(),
    }

    setScenarios((prev) => [newScenario, ...prev])
    setScenarioForm({
      name: "",
      baseCalculationId: "",
      scenarios: [
        { name: "Optimistic", costPriceChange: -10, sellingPriceChange: 5, quantityChange: 20 },
        { name: "Pessimistic", costPriceChange: 10, sellingPriceChange: -5, quantityChange: -20 },
        { name: "Realistic", costPriceChange: 0, sellingPriceChange: 0, quantityChange: 0 },
      ],
    })
    setMessage("Scenario analysis created successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const duplicateCalculation = (calc: ProfitCalculation) => {
    setFormData({
      productName: `${calc.productName} (Copy)`,
      costPrice: (calc.costPrice - calc.variableCosts).toString(),
      sellingPrice: calc.sellingPrice.toString(),
      quantity: calc.quantity.toString(),
      fixedCosts: calc.fixedCosts.toString(),
      variableCosts: calc.variableCosts.toString(),
      category: calc.category,
      notes: calc.notes,
    })
    setActiveTab("calculator")
    setMessage("Calculation duplicated to form")
    setTimeout(() => setMessage(""), 3000)
  }

  const deleteCalculation = (id: string) => {
    if (window.confirm("Are you sure you want to delete this calculation?")) {
      setCalculations((prev) => prev.filter((c) => c.id !== id))
      setMessage("Calculation deleted")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const clearAllCalculations = () => {
    if (window.confirm("Are you sure you want to clear all calculations? This cannot be undone.")) {
      setCalculations([])
      setScenarios([])
      localStorage.removeItem("swot-profit-calculations")
      localStorage.removeItem("swot-profit-scenarios")
      setMessage("All data cleared")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const downloadCSV = () => {
    if (calculations.length === 0) {
      setMessage("No calculations to export")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    const headers = [
      "Product Name",
      "Category",
      "Cost Price",
      "Selling Price",
      "Quantity",
      "Fixed Costs",
      "Variable Costs",
      "Profit Per Unit",
      "Total Profit",
      "Profit Margin %",
      "Gross Margin %",
      "Markup %",
      "ROI %",
      "Break Even Units",
      "Break Even Revenue",
      "Date",
      "Notes",
    ]

    const csvData = [
      headers,
      ...calculations.map((calc) => [
        calc.productName,
        calc.category,
        calc.costPrice.toString(),
        calc.sellingPrice.toString(),
        calc.quantity.toString(),
        calc.fixedCosts.toString(),
        calc.variableCosts.toString(),
        calc.profitPerUnit.toString(),
        calc.totalProfit.toString(),
        calc.profitMargin.toFixed(2),
        calc.grossMargin.toFixed(2),
        calc.markup.toFixed(2),
        calc.roi.toFixed(2),
        calc.breakEvenUnits.toString(),
        calc.breakEvenRevenue.toString(),
        new Date(calc.calculatedAt).toLocaleString(),
        calc.notes,
      ]),
    ]

    const csvContent = csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `profit-calculations-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    setMessage("CSV file downloaded successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const downloadEnhancedPDF = async () => {
    if (calculations.length === 0 && !currentCalculation) {
      setMessage("No calculations to export")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    setIsLoading(true)
    try {
      const jsPDF = (await import("jspdf")).default
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF()

      // Header
      doc.setFontSize(20)
      doc.setTextColor(22, 163, 74)
      doc.text("Enhanced Profit Analysis Report", 20, 25)

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35)

      let yPosition = 50

      // Executive Summary
      if (calculations.length > 0) {
        const totalRevenue = calculations.reduce((sum, calc) => sum + calc.sellingPrice * calc.quantity, 0)
        const totalCosts = calculations.reduce((sum, calc) => sum + calc.costPrice * calc.quantity + calc.fixedCosts, 0)
        const totalProfit = calculations.reduce((sum, calc) => sum + calc.totalProfit, 0)
        const avgMargin = calculations.reduce((sum, calc) => sum + calc.profitMargin, 0) / calculations.length
        const avgROI = calculations.reduce((sum, calc) => sum + calc.roi, 0) / calculations.length

        doc.setFontSize(16)
        doc.setTextColor(22, 163, 74)
        doc.text("Executive Summary", 20, yPosition)
        yPosition += 15

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(`Total Calculations: ${calculations.length}`, 20, yPosition)
        yPosition += 8
        doc.text(`Total Revenue: PKR ${totalRevenue.toLocaleString()}`, 20, yPosition)
        yPosition += 8
        doc.text(`Total Costs: PKR ${totalCosts.toLocaleString()}`, 20, yPosition)
        yPosition += 8
        doc.text(`Total Profit: PKR ${totalProfit.toLocaleString()}`, 20, yPosition)
        yPosition += 8
        doc.text(`Average Profit Margin: ${avgMargin.toFixed(2)}%`, 20, yPosition)
        yPosition += 8
        doc.text(`Average ROI: ${avgROI.toFixed(2)}%`, 20, yPosition)
        yPosition += 20
      }

      // Current calculation
      if (currentCalculation) {
        if (yPosition > 200) {
          doc.addPage()
          yPosition = 30
        }

        doc.setFontSize(16)
        doc.setTextColor(22, 163, 74)
        doc.text("Current Calculation", 20, yPosition)
        yPosition += 15

        const currentData = [
          ["Product Name", currentCalculation.productName],
          ["Category", currentCalculation.category],
          ["Cost Price", `PKR ${currentCalculation.costPrice.toLocaleString()}`],
          ["Selling Price", `PKR ${currentCalculation.sellingPrice.toLocaleString()}`],
          ["Quantity", currentCalculation.quantity.toLocaleString()],
          ["Fixed Costs", `PKR ${currentCalculation.fixedCosts.toLocaleString()}`],
          ["Variable Costs", `PKR ${currentCalculation.variableCosts.toLocaleString()}`],
          ["Profit per Unit", `PKR ${currentCalculation.profitPerUnit.toLocaleString()}`],
          ["Total Profit", `PKR ${currentCalculation.totalProfit.toLocaleString()}`],
          ["Profit Margin", `${currentCalculation.profitMargin.toFixed(2)}%`],
          ["Gross Margin", `${currentCalculation.grossMargin.toFixed(2)}%`],
          ["Markup", `${currentCalculation.markup.toFixed(2)}%`],
          ["ROI", `${currentCalculation.roi.toFixed(2)}%`],
          ["Break Even Units", currentCalculation.breakEvenUnits.toLocaleString()],
          ["Break Even Revenue", `PKR ${currentCalculation.breakEvenRevenue.toLocaleString()}`],
        ]
        ;(doc as any).autoTable({
          body: currentData,
          startY: yPosition,
          theme: "grid",
          headStyles: { fillColor: [22, 163, 74] },
          columnStyles: { 0: { fontStyle: "bold" } },
        })

        yPosition = (doc as any).lastAutoTable.finalY + 20
      }

      // Historical calculations
      if (calculations.length > 0) {
        if (yPosition > 150) {
          doc.addPage()
          yPosition = 30
        }

        doc.setFontSize(16)
        doc.setTextColor(22, 163, 74)
        doc.text("Historical Calculations", 20, yPosition)
        yPosition += 15

        const tableData = calculations
          .slice(0, 20)
          .map((calc) => [
            calc.productName,
            calc.category,
            `PKR ${calc.costPrice.toLocaleString()}`,
            `PKR ${calc.sellingPrice.toLocaleString()}`,
            calc.quantity.toLocaleString(),
            `PKR ${calc.totalProfit.toLocaleString()}`,
            `${calc.profitMargin.toFixed(1)}%`,
            `${calc.roi.toFixed(1)}%`,
            new Date(calc.calculatedAt).toLocaleDateString(),
          ])
        ;(doc as any).autoTable({
          head: [["Product", "Category", "Cost", "Selling", "Qty", "Profit", "Margin", "ROI", "Date"]],
          body: tableData,
          startY: yPosition,
          headStyles: { fillColor: [22, 163, 74] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          styles: { fontSize: 8 },
        })
      }

      // Scenario analyses
      if (scenarios.length > 0) {
        doc.addPage()
        yPosition = 30

        doc.setFontSize(16)
        doc.setTextColor(22, 163, 74)
        doc.text("Scenario Analyses", 20, yPosition)
        yPosition += 15

        scenarios.slice(0, 3).forEach((scenario) => {
          if (yPosition > 200) {
            doc.addPage()
            yPosition = 30
          }

          doc.setFontSize(14)
          doc.setTextColor(0, 0, 0)
          doc.text(scenario.name, 20, yPosition)
          yPosition += 10

          const scenarioData = scenario.scenarios.map((s) => [
            s.name,
            `${s.costPriceChange > 0 ? "+" : ""}${s.costPriceChange}%`,
            `${s.sellingPriceChange > 0 ? "+" : ""}${s.sellingPriceChange}%`,
            `${s.quantityChange > 0 ? "+" : ""}${s.quantityChange}%`,
            `PKR ${s.result.totalProfit.toLocaleString()}`,
            `${s.result.profitMargin.toFixed(1)}%`,
          ])
          ;(doc as any).autoTable({
            head: [["Scenario", "Cost Δ", "Price Δ", "Qty Δ", "Profit", "Margin"]],
            body: scenarioData,
            startY: yPosition,
            headStyles: { fillColor: [22, 163, 74] },
            styles: { fontSize: 9 },
          })

          yPosition = (doc as any).lastAutoTable.finalY + 15
        })
      }

      // Footer
      const pageHeight = doc.internal.pageSize.height
      doc.setFontSize(10)
      doc.setTextColor(128, 128, 128)
      doc.text("Generated by Swot.works Tools", 20, pageHeight - 20)

      doc.save(`enhanced-profit-analysis-${new Date().toISOString().split("T")[0]}.pdf`)
      setMessage("Enhanced PDF report downloaded successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      setMessage("Error generating PDF. Please try again.")
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const getAnalytics = () => {
    if (calculations.length === 0) return null

    const totalRevenue = calculations.reduce((sum, calc) => sum + calc.sellingPrice * calc.quantity, 0)
    const totalProfit = calculations.reduce((sum, calc) => sum + calc.totalProfit, 0)
    const avgMargin = calculations.reduce((sum, calc) => sum + calc.profitMargin, 0) / calculations.length
    const avgROI = calculations.reduce((sum, calc) => sum + calc.roi, 0) / calculations.length

    const profitableProducts = calculations.filter((calc) => calc.totalProfit > 0).length
    const lossProducts = calculations.filter((calc) => calc.totalProfit < 0).length

    const categoryBreakdown = PRODUCT_CATEGORIES.map((category) => {
      const categoryCalcs = calculations.filter((calc) => calc.category === category)
      return {
        category,
        count: categoryCalcs.length,
        totalProfit: categoryCalcs.reduce((sum, calc) => sum + calc.totalProfit, 0),
        avgMargin:
          categoryCalcs.length > 0
            ? categoryCalcs.reduce((sum, calc) => sum + calc.profitMargin, 0) / categoryCalcs.length
            : 0,
      }
    }).filter((item) => item.count > 0)

    return {
      totalRevenue,
      totalProfit,
      avgMargin,
      avgROI,
      profitableProducts,
      lossProducts,
      categoryBreakdown,
    }
  }

  const analytics = getAnalytics()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showBackButton />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Profit Calculator</h1>
          <p className="text-gray-600">
            Advanced financial analysis with break-even, ROI, scenario planning, and comprehensive reporting
          </p>
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Processing</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enhanced Calculator Input */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Profit Calculator</CardTitle>
                    <CardDescription>Complete financial analysis with break-even and ROI calculations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="productName">Product Name</Label>
                        <Input
                          id="productName"
                          placeholder="e.g., Premium Widget, Consulting Service..."
                          value={formData.productName}
                          onChange={(e) => setFormData((prev) => ({ ...prev, productName: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRODUCT_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={formData.quantity}
                          onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="costPrice">Unit Cost Price (PKR)</Label>
                        <Input
                          id="costPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.costPrice}
                          onChange={(e) => setFormData((prev) => ({ ...prev, costPrice: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="sellingPrice">Unit Selling Price (PKR)</Label>
                        <Input
                          id="sellingPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.sellingPrice}
                          onChange={(e) => setFormData((prev) => ({ ...prev, sellingPrice: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="variableCosts">Variable Costs per Unit (PKR)</Label>
                        <Input
                          id="variableCosts"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.variableCosts}
                          onChange={(e) => setFormData((prev) => ({ ...prev, variableCosts: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="fixedCosts">Fixed Costs (PKR)</Label>
                        <Input
                          id="fixedCosts"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={formData.fixedCosts}
                          onChange={(e) => setFormData((prev) => ({ ...prev, fixedCosts: e.target.value }))}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Additional notes about this calculation..."
                          value={formData.notes}
                          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button
                        onClick={saveCalculation}
                        disabled={!currentCalculation}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Save Calculation
                      </Button>

                      <Button
                        onClick={downloadEnhancedPDF}
                        disabled={isLoading || (calculations.length === 0 && !currentCalculation)}
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {isLoading ? "Generating..." : "Download Report"}
                      </Button>

                      <Button
                        onClick={downloadCSV}
                        disabled={calculations.length === 0}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Results */}
                {currentCalculation && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Analysis Results</CardTitle>
                      <CardDescription>Comprehensive profit and performance metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div
                            className={`text-xl font-bold ${
                              currentCalculation.profitPerUnit >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            PKR {currentCalculation.profitPerUnit.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Profit per Unit</div>
                        </div>

                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div
                            className={`text-xl font-bold ${
                              currentCalculation.totalProfit >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            PKR {currentCalculation.totalProfit.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Total Profit</div>
                        </div>

                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div
                            className={`text-xl font-bold ${
                              currentCalculation.profitMargin >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {currentCalculation.profitMargin.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Profit Margin</div>
                        </div>

                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                          <div className="text-xl font-bold text-blue-600">
                            {currentCalculation.grossMargin.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Gross Margin</div>
                        </div>

                        <div className="text-center p-3 bg-indigo-50 rounded-lg">
                          <div className="text-xl font-bold text-purple-600">
                            {currentCalculation.markup.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Markup</div>
                        </div>

                        <div className="text-center p-3 bg-pink-50 rounded-lg">
                          <div
                            className={`text-xl font-bold ${
                              currentCalculation.roi >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {currentCalculation.roi.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">ROI</div>
                        </div>
                      </div>

                      {/* Break-even Analysis */}
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Break-Even Analysis
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-lg font-bold text-orange-600">
                              {currentCalculation.breakEvenUnits.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Units to Break Even</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-orange-600">
                              PKR {currentCalculation.breakEvenRevenue.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Revenue to Break Even</div>
                          </div>
                        </div>
                        {currentCalculation.quantity < currentCalculation.breakEvenUnits && (
                          <div className="mt-2 flex items-center text-amber-600">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                              Need {(currentCalculation.breakEvenUnits - currentCalculation.quantity).toLocaleString()}{" "}
                              more units to break even
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Charts and Visualizations */}
              <div className="space-y-6">
                {/* Profit Breakdown Chart */}
                {currentCalculation && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PieChart className="w-5 h-5 mr-2" />
                        Revenue Breakdown
                      </CardTitle>
                      <CardDescription>Visual analysis of costs vs profit</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <canvas ref={chartRef} />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Trend Analysis */}
                {calculations.length > 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Profit Trends
                      </CardTitle>
                      <CardDescription>Historical performance analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <canvas ref={trendChartRef} />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Calculation Processing</CardTitle>
                <CardDescription>Process multiple calculations at once using CSV format</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bulkData">Bulk Data (CSV Format)</Label>
                  <Textarea
                    id="bulkData"
                    placeholder={`Enter data in CSV format, one product per line:
Product Name, Cost Price, Selling Price, Quantity, Fixed Costs, Variable Costs

Example:
Widget A, 100, 150, 50, 1000, 10
Service B, 200, 300, 25, 500, 20
Product C, 75, 120, 100, 2000, 5`}
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">CSV Format Instructions:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Each line represents one product calculation</li>
                    <li>• Separate values with commas</li>
                    <li>• Required: Product Name, Cost Price, Selling Price, Quantity</li>
                    <li>• Optional: Fixed Costs, Variable Costs (default to 0)</li>
                    <li>• Use numbers only for price and quantity fields</li>
                  </ul>
                </div>

                <Button onClick={processBulkCalculations} className="bg-green-600 hover:bg-green-700">
                  <Calculator className="w-4 h-4 mr-2" />
                  Process Bulk Calculations
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Create Scenario */}
              <Card>
                <CardHeader>
                  <CardTitle>Scenario Analysis</CardTitle>
                  <CardDescription>Analyze different what-if scenarios based on existing calculations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="scenarioName">Scenario Name</Label>
                    <Input
                      id="scenarioName"
                      placeholder="e.g., Q2 2025 Projections"
                      value={scenarioForm.name}
                      onChange={(e) => setScenarioForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="baseCalculation">Base Calculation</Label>
                    <Select
                      value={scenarioForm.baseCalculationId}
                      onValueChange={(value) => setScenarioForm((prev) => ({ ...prev, baseCalculationId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a calculation" />
                      </SelectTrigger>
                      <SelectContent>
                        {calculations.map((calc) => (
                          <SelectItem key={calc.id} value={calc.id}>
                            {calc.productName} - PKR {calc.totalProfit.toLocaleString()} profit
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Scenario Parameters (% change)</Label>
                    {scenarioForm.scenarios.map((scenario, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 items-center">
                        <Input
                          placeholder="Scenario name"
                          value={scenario.name}
                          onChange={(e) => {
                            const newScenarios = [...scenarioForm.scenarios]
                            newScenarios[index].name = e.target.value
                            setScenarioForm((prev) => ({ ...prev, scenarios: newScenarios }))
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Cost %"
                          value={scenario.costPriceChange}
                          onChange={(e) => {
                            const newScenarios = [...scenarioForm.scenarios]
                            newScenarios[index].costPriceChange = Number.parseFloat(e.target.value) || 0
                            setScenarioForm((prev) => ({ ...prev, scenarios: newScenarios }))
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Price %"
                          value={scenario.sellingPriceChange}
                          onChange={(e) => {
                            const newScenarios = [...scenarioForm.scenarios]
                            newScenarios[index].sellingPriceChange = Number.parseFloat(e.target.value) || 0
                            setScenarioForm((prev) => ({ ...prev, scenarios: newScenarios }))
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Qty %"
                          value={scenario.quantityChange}
                          onChange={(e) => {
                            const newScenarios = [...scenarioForm.scenarios]
                            newScenarios[index].quantityChange = Number.parseFloat(e.target.value) || 0
                            setScenarioForm((prev) => ({ ...prev, scenarios: newScenarios }))
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={createScenarioAnalysis}
                    disabled={!scenarioForm.baseCalculationId}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Create Scenario Analysis
                  </Button>
                </CardContent>
              </Card>

              {/* Scenario Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Scenario Results ({scenarios.length})</CardTitle>
                  <CardDescription>Compare different business scenarios</CardDescription>
                </CardHeader>
                <CardContent>
                  {scenarios.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p>No scenario analyses created yet</p>
                      <p className="text-sm">Create your first scenario to compare different outcomes</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {scenarios.map((scenario) => (
                        <div key={scenario.id} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-3">{scenario.name}</h4>
                          <div className="space-y-2">
                            {scenario.scenarios.map((s, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span className="font-medium">{s.name}:</span>
                                <div className="flex items-center gap-4">
                                  <span className={s.result.totalProfit >= 0 ? "text-green-600" : "text-red-600"}>
                                    PKR {s.result.totalProfit.toLocaleString()}
                                  </span>
                                  <Badge
                                    className={
                                      s.result.profitMargin >= 0
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }
                                  >
                                    {s.result.profitMargin.toFixed(1)}%
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Base: {scenario.baseCalculation.productName} •{" "}
                            {new Date(scenario.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {analytics ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Key Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Business Performance
                    </CardTitle>
                    <CardDescription>Overall financial performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          PKR {analytics.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Revenue</div>
                      </div>

                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div
                          className={`text-2xl font-bold ${
                            analytics.totalProfit >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          PKR {analytics.totalProfit.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Profit</div>
                      </div>

                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{analytics.avgMargin.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Avg Margin</div>
                      </div>

                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{analytics.avgROI.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Avg ROI</div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">{analytics.profitableProducts}</div>
                        <div className="text-sm text-gray-600">Profitable Products</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-600">{analytics.lossProducts}</div>
                        <div className="text-sm text-gray-600">Loss-Making Products</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Category Performance</CardTitle>
                    <CardDescription>Profit analysis by product category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.categoryBreakdown.map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{category.category}</div>
                            <div className="text-sm text-gray-600">{category.count} products</div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-semibold ${
                                category.totalProfit >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              PKR {category.totalProfit.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">{category.avgMargin.toFixed(1)}% avg margin</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Available</h3>
                  <p className="text-gray-500">Create some calculations to see detailed analytics and insights</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Calculation History</CardTitle>
                  <CardDescription>{calculations.length} saved calculations</CardDescription>
                </div>
                <div className="flex gap-2">
                  {calculations.length > 0 && (
                    <>
                      <Button onClick={downloadCSV} variant="outline" size="sm">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                      <Button onClick={clearAllCalculations} variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {calculations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>No calculations saved yet. Complete a calculation to get started.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Selling</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Total Profit</TableHead>
                          <TableHead>Margin</TableHead>
                          <TableHead>ROI</TableHead>
                          <TableHead>Break Even</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calculations.map((calc) => (
                          <TableRow key={calc.id}>
                            <TableCell className="font-medium">{calc.productName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{calc.category}</Badge>
                            </TableCell>
                            <TableCell>PKR {calc.costPrice.toLocaleString()}</TableCell>
                            <TableCell>PKR {calc.sellingPrice.toLocaleString()}</TableCell>
                            <TableCell>{calc.quantity.toLocaleString()}</TableCell>
                            <TableCell className={calc.totalProfit >= 0 ? "text-green-600" : "text-red-600"}>
                              PKR {calc.totalProfit.toLocaleString()}
                            </TableCell>
                            <TableCell className={calc.profitMargin >= 0 ? "text-green-600" : "text-red-600"}>
                              {calc.profitMargin.toFixed(1)}%
                            </TableCell>
                            <TableCell className={calc.roi >= 0 ? "text-green-600" : "text-red-600"}>
                              {calc.roi.toFixed(1)}%
                            </TableCell>
                            <TableCell>{calc.breakEvenUnits.toLocaleString()}</TableCell>
                            <TableCell>{new Date(calc.calculatedAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => duplicateCalculation(calc)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteCalculation(calc.id)}
                                  className="text-red-600 hover:text-red-700"
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

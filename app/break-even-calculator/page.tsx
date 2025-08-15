"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PageWrapper } from "@/components/page-wrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { BarChart3, Download, FileImage, Trash2, Calculator, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

interface BreakEvenData {
  id: string
  name: string
  fixedCosts: number
  variableCostPerUnit: number
  sellingPricePerUnit: number
  breakEvenUnits: number
  breakEvenRevenue: number
  contributionMargin: number
  contributionMarginRatio: number
  createdAt: string
}

export default function BreakEvenCalculatorPage() {
  const { toast } = useToast()
  const [calculations, setCalculations] = useState<BreakEvenData[]>([])
  const [currentCalculation, setCurrentCalculation] = useState<Partial<BreakEvenData>>({
    name: "",
    fixedCosts: 0,
    variableCostPerUnit: 0,
    sellingPricePerUnit: 0,
  })

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("breakEvenCalculations")
    if (saved) {
      setCalculations(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("breakEvenCalculations", JSON.stringify(calculations))
  }, [calculations])

  const calculateBreakEven = () => {
    const { fixedCosts, variableCostPerUnit, sellingPricePerUnit } = currentCalculation

    if (!fixedCosts || !sellingPricePerUnit || sellingPricePerUnit <= variableCostPerUnit!) {
      toast({
        title: "Invalid Input",
        description: "Please ensure selling price is greater than variable cost per unit.",
        variant: "destructive",
      })
      return
    }

    const contributionMargin = sellingPricePerUnit - (variableCostPerUnit || 0)
    const contributionMarginRatio = contributionMargin / sellingPricePerUnit
    const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin)
    const breakEvenRevenue = breakEvenUnits * sellingPricePerUnit

    const newCalculation: BreakEvenData = {
      id: Date.now().toString(),
      name: currentCalculation.name || `Analysis ${calculations.length + 1}`,
      fixedCosts: fixedCosts,
      variableCostPerUnit: variableCostPerUnit || 0,
      sellingPricePerUnit: sellingPricePerUnit,
      breakEvenUnits,
      breakEvenRevenue,
      contributionMargin,
      contributionMarginRatio,
      createdAt: new Date().toISOString(),
    }

    setCalculations([newCalculation, ...calculations])
    setCurrentCalculation({
      name: "",
      fixedCosts: 0,
      variableCostPerUnit: 0,
      sellingPricePerUnit: 0,
    })

    toast({
      title: "Break-Even Analysis Complete",
      description: `Break-even point: ${breakEvenUnits} units (PKR ${breakEvenRevenue.toLocaleString()})`,
    })
  }

  const deleteCalculation = (id: string) => {
    setCalculations(calculations.filter((calc) => calc.id !== id))
    toast({
      title: "Calculation Deleted",
      description: "Break-even analysis has been removed.",
    })
  }

  const clearAllData = () => {
    setCalculations([])
    setCurrentCalculation({
      name: "",
      fixedCosts: 0,
      variableCostPerUnit: 0,
      sellingPricePerUnit: 0,
    })
    toast({
      title: "All Data Cleared",
      description: "All break-even calculations have been removed.",
    })
  }

  // Chart data for break-even visualization
  const getChartData = (calc: BreakEvenData) => {
    const units = Array.from({ length: Math.ceil(calc.breakEvenUnits * 1.5) }, (_, i) => i + 1)
    const revenues = units.map((u) => u * calc.sellingPricePerUnit)
    const totalCosts = units.map((u) => calc.fixedCosts + u * calc.variableCostPerUnit)

    return {
      labels: units.filter((_, i) => i % Math.ceil(units.length / 10) === 0),
      datasets: [
        {
          label: "Revenue",
          data: revenues.filter((_, i) => i % Math.ceil(units.length / 10) === 0),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.1,
        },
        {
          label: "Total Costs",
          data: totalCosts.filter((_, i) => i % Math.ceil(units.length / 10) === 0),
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.1,
        },
      ],
    }
  }

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Break-Even Analysis Chart",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Units Sold",
        },
      },
      y: {
        title: {
          display: true,
          text: "Amount (PKR)",
        },
      },
    },
  }

  const exportToPDF = async (calc?: BreakEvenData) => {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()

    // Header
    pdf.setFontSize(20)
    pdf.text("Break-Even Analysis Report", pageWidth / 2, 20, { align: "center" })
    pdf.setFontSize(12)
    pdf.text(`Generated by Swot.works Tools — ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, {
      align: "center",
    })

    let yPosition = 50

    if (calc) {
      // Single calculation
      pdf.setFontSize(16)
      pdf.text(`Analysis: ${calc.name}`, 20, yPosition)
      yPosition += 20

      const data = [
        ["Fixed Costs", `PKR ${calc.fixedCosts.toLocaleString()}`],
        ["Variable Cost per Unit", `PKR ${calc.variableCostPerUnit.toLocaleString()}`],
        ["Selling Price per Unit", `PKR ${calc.sellingPricePerUnit.toLocaleString()}`],
        ["Contribution Margin", `PKR ${calc.contributionMargin.toLocaleString()}`],
        ["Contribution Margin Ratio", `${(calc.contributionMarginRatio * 100).toFixed(1)}%`],
        ["Break-Even Units", calc.breakEvenUnits.toLocaleString()],
        ["Break-Even Revenue", `PKR ${calc.breakEvenRevenue.toLocaleString()}`],
      ]

      data.forEach(([label, value]) => {
        pdf.text(`${label}: ${value}`, 20, yPosition)
        yPosition += 10
      })
    } else {
      // All calculations summary
      calculations.forEach((calc, index) => {
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 20
        }

        pdf.setFontSize(14)
        pdf.text(`${index + 1}. ${calc.name}`, 20, yPosition)
        yPosition += 10

        pdf.setFontSize(10)
        pdf.text(
          `Break-Even: ${calc.breakEvenUnits} units (PKR ${calc.breakEvenRevenue.toLocaleString()})`,
          25,
          yPosition,
        )
        yPosition += 8
        pdf.text(`Contribution Margin: ${(calc.contributionMarginRatio * 100).toFixed(1)}%`, 25, yPosition)
        yPosition += 15
      })
    }

    // Footer
    const pageCount = pdf.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(8)
      pdf.text("Generated by Swot.works Tools — 2025", pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, {
        align: "center",
      })
    }

    pdf.save(`break-even-analysis-${new Date().toISOString().split("T")[0]}.pdf`)
    toast({
      title: "PDF Exported",
      description: "Break-even analysis has been exported successfully.",
    })
  }

  const exportToJPEG = async (calc: BreakEvenData) => {
    const element = document.getElementById(`chart-${calc.id}`)
    if (element) {
      const canvas = await html2canvas(element, { scale: 2 })
      const link = document.createElement("a")
      link.download = `break-even-chart-${calc.name.replace(/\s+/g, "-")}.jpg`
      link.href = canvas.toDataURL("image/jpeg", 0.9)
      link.click()

      toast({
        title: "JPEG Exported",
        description: "Break-even chart has been exported as JPEG.",
      })
    }
  }

  return (
    <PageWrapper
      title="Break-Even Calculator"
      description="Calculate break-even points with visual analysis and comprehensive reporting"
    >
      <div className="space-y-8">
        {/* Input Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Break-Even Analysis
              </CardTitle>
              <CardDescription>Enter your business costs and pricing to calculate the break-even point</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Analysis Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Product Launch Analysis"
                    value={currentCalculation.name}
                    onChange={(e) => setCurrentCalculation({ ...currentCalculation, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fixedCosts">Fixed Costs (PKR)</Label>
                  <Input
                    id="fixedCosts"
                    type="number"
                    placeholder="e.g., 100000"
                    value={currentCalculation.fixedCosts || ""}
                    onChange={(e) =>
                      setCurrentCalculation({
                        ...currentCalculation,
                        fixedCosts: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variableCost">Variable Cost per Unit (PKR)</Label>
                  <Input
                    id="variableCost"
                    type="number"
                    placeholder="e.g., 50"
                    value={currentCalculation.variableCostPerUnit || ""}
                    onChange={(e) =>
                      setCurrentCalculation({
                        ...currentCalculation,
                        variableCostPerUnit: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price per Unit (PKR)</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    placeholder="e.g., 100"
                    value={currentCalculation.sellingPricePerUnit || ""}
                    onChange={(e) =>
                      setCurrentCalculation({
                        ...currentCalculation,
                        sellingPricePerUnit: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={calculateBreakEven} className="bg-green-600 hover:bg-green-700">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Calculate Break-Even
                </Button>
                <Button variant="outline" onClick={clearAllData}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        {calculations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Break-Even Analysis Results</h2>
              <Button onClick={() => exportToPDF()} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export All PDF
              </Button>
            </div>

            {calculations.map((calc, index) => (
              <motion.div
                key={calc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        {calc.name}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => exportToPDF(calc)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => exportToJPEG(calc)}>
                          <FileImage className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteCalculation(calc.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>Created on {new Date(calc.createdAt).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Key Metrics */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Key Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">Break-Even Units</p>
                            <p className="text-2xl font-bold text-green-600">{calc.breakEvenUnits.toLocaleString()}</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">Break-Even Revenue</p>
                            <p className="text-2xl font-bold text-blue-600">
                              PKR {calc.breakEvenRevenue.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">Contribution Margin</p>
                            <p className="text-2xl font-bold text-purple-600">
                              PKR {calc.contributionMargin.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">Margin Ratio</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {(calc.contributionMarginRatio * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <h4 className="font-medium">Input Summary</h4>
                          <div className="text-sm space-y-1">
                            <p>Fixed Costs: PKR {calc.fixedCosts.toLocaleString()}</p>
                            <p>Variable Cost per Unit: PKR {calc.variableCostPerUnit.toLocaleString()}</p>
                            <p>Selling Price per Unit: PKR {calc.sellingPricePerUnit.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Chart */}
                      <div id={`chart-${calc.id}`} className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                        <Line data={getChartData(calc)} options={chartOptions} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {calculations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center py-12"
          >
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Break-Even Analyses Yet</h3>
            <p className="text-muted-foreground">
              Create your first break-even analysis to understand when your business becomes profitable.
            </p>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  )
}

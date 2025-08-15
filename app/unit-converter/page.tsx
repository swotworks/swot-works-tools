"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PageWrapper } from "@/components/page-wrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Ruler, Download, FileImage, ArrowRightLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import "jspdf-autotable"
import html2canvas from "html2canvas"

interface ConversionHistory {
  id: string
  category: string
  fromUnit: string
  toUnit: string
  amount: number
  result: number
  timestamp: string
}

const conversions = {
  length: {
    name: "Length",
    units: {
      mm: { name: "Millimeter", factor: 1 },
      cm: { name: "Centimeter", factor: 10 },
      m: { name: "Meter", factor: 1000 },
      km: { name: "Kilometer", factor: 1000000 },
      in: { name: "Inch", factor: 25.4 },
      ft: { name: "Foot", factor: 304.8 },
      yd: { name: "Yard", factor: 914.4 },
      mi: { name: "Mile", factor: 1609344 },
    },
  },
  weight: {
    name: "Weight",
    units: {
      mg: { name: "Milligram", factor: 1 },
      g: { name: "Gram", factor: 1000 },
      kg: { name: "Kilogram", factor: 1000000 },
      oz: { name: "Ounce", factor: 28349.5 },
      lb: { name: "Pound", factor: 453592 },
      ton: { name: "Metric Ton", factor: 1000000000 },
    },
  },
  volume: {
    name: "Volume",
    units: {
      ml: { name: "Milliliter", factor: 1 },
      l: { name: "Liter", factor: 1000 },
      "fl oz": { name: "Fluid Ounce", factor: 29.5735 },
      cup: { name: "Cup", factor: 236.588 },
      pt: { name: "Pint", factor: 473.176 },
      qt: { name: "Quart", factor: 946.353 },
      gal: { name: "Gallon", factor: 3785.41 },
    },
  },
  area: {
    name: "Area",
    units: {
      "mm²": { name: "Square Millimeter", factor: 1 },
      "cm²": { name: "Square Centimeter", factor: 100 },
      "m²": { name: "Square Meter", factor: 1000000 },
      "km²": { name: "Square Kilometer", factor: 1000000000000 },
      "in²": { name: "Square Inch", factor: 645.16 },
      "ft²": { name: "Square Foot", factor: 92903 },
      "yd²": { name: "Square Yard", factor: 836127 },
      acre: { name: "Acre", factor: 4046856422.4 },
    },
  },
}

export default function UnitConverterPage() {
  const { toast } = useToast()
  const [activeCategory, setActiveCategory] = useState<string>("length")
  const [amount, setAmount] = useState<number>(1)
  const [fromUnit, setFromUnit] = useState<string>("m")
  const [toUnit, setToUnit] = useState<string>("ft")
  const [result, setResult] = useState<number>(0)
  const [history, setHistory] = useState<ConversionHistory[]>([])

  // Load data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("unitConversionHistory")
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("unitConversionHistory", JSON.stringify(history))
  }, [history])

  // Reset units when category changes
  useEffect(() => {
    const categoryUnits = Object.keys(conversions[activeCategory as keyof typeof conversions].units)
    setFromUnit(categoryUnits[0])
    setToUnit(categoryUnits[1] || categoryUnits[0])
  }, [activeCategory])

  // Calculate conversion
  useEffect(() => {
    if (amount && fromUnit && toUnit && activeCategory) {
      const category = conversions[activeCategory as keyof typeof conversions]
      const fromFactor = category.units[fromUnit as keyof typeof category.units]?.factor || 1
      const toFactor = category.units[toUnit as keyof typeof category.units]?.factor || 1
      const convertedAmount = (amount * fromFactor) / toFactor
      setResult(convertedAmount)
    }
  }, [amount, fromUnit, toUnit, activeCategory])

  const performConversion = () => {
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to convert.",
        variant: "destructive",
      })
      return
    }

    const conversion: ConversionHistory = {
      id: Date.now().toString(),
      category: activeCategory,
      fromUnit,
      toUnit,
      amount,
      result,
      timestamp: new Date().toISOString(),
    }

    setHistory([conversion, ...history.slice(0, 49)]) // Keep last 50 conversions

    toast({
      title: "Conversion Complete",
      description: `${amount} ${fromUnit} = ${result.toFixed(6)} ${toUnit}`,
    })
  }

  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  const clearHistory = () => {
    setHistory([])
    toast({
      title: "History Cleared",
      description: "Conversion history has been cleared.",
    })
  }

  const exportToPDF = async () => {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()

    // Header
    pdf.setFontSize(20)
    pdf.text("Unit Conversion Report", pageWidth / 2, 20, { align: "center" })
    pdf.setFontSize(12)
    pdf.text(`Generated by Swot.works Tools — ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, {
      align: "center",
    })

    let yPosition = 50

    // Conversion tables for each category
    Object.entries(conversions).forEach(([categoryKey, category]) => {
      if (yPosition > 200) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFontSize(16)
      pdf.text(`${category.name} Conversion Reference`, 20, yPosition)
      yPosition += 15

      const tableData = Object.entries(category.units).map(([unit, { name, factor }]) => [
        unit,
        name,
        factor.toString(),
      ])
      ;(pdf as any).autoTable({
        head: [["Unit", "Name", "Factor (base unit)"]],
        body: tableData,
        startY: yPosition,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 163, 74] },
      })

      yPosition = (pdf as any).lastAutoTable.finalY + 20
    })

    // Conversion history
    if (history.length > 0) {
      if (yPosition > 200) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFontSize(16)
      pdf.text("Recent Conversions", 20, yPosition)
      yPosition += 10

      const historyData = history
        .slice(0, 20)
        .map((conv) => [
          new Date(conv.timestamp).toLocaleDateString(),
          conv.category,
          `${conv.amount} ${conv.fromUnit}`,
          `${conv.result.toFixed(6)} ${conv.toUnit}`,
        ])
      ;(pdf as any).autoTable({
        head: [["Date", "Category", "From", "To"]],
        body: historyData,
        startY: yPosition,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 163, 74] },
      })
    }

    // Footer
    pdf.setFontSize(8)
    pdf.text("Generated by Swot.works Tools — 2025", pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, {
      align: "center",
    })

    pdf.save(`unit-conversion-${new Date().toISOString().split("T")[0]}.pdf`)
    toast({
      title: "PDF Exported",
      description: "Unit conversion report has been exported successfully.",
    })
  }

  const exportToJPEG = async () => {
    const element = document.getElementById("conversion-reference")
    if (element) {
      const canvas = await html2canvas(element, { scale: 2 })
      const link = document.createElement("a")
      link.download = `unit-conversion-${new Date().toISOString().split("T")[0]}.jpg`
      link.href = canvas.toDataURL("image/jpeg", 0.9)
      link.click()

      toast({
        title: "JPEG Exported",
        description: "Unit conversion reference has been exported as JPEG.",
      })
    }
  }

  const currentCategory = conversions[activeCategory as keyof typeof conversions]

  return (
    <PageWrapper
      title="Unit Converter"
      description="Convert between length, weight, volume, and area units with offline functionality"
    >
      <div className="space-y-8">
        {/* Unit Converter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Unit Converter
              </CardTitle>
              <CardDescription>Convert between different units of measurement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="length">Length</TabsTrigger>
                  <TabsTrigger value="weight">Weight</TabsTrigger>
                  <TabsTrigger value="volume">Volume</TabsTrigger>
                  <TabsTrigger value="area">Area</TabsTrigger>
                </TabsList>

                {Object.entries(conversions).map(([categoryKey, category]) => (
                  <TabsContent key={categoryKey} value={categoryKey} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          min="0"
                          step="0.000001"
                          value={amount}
                          onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
                          className="text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>From</Label>
                        <Select value={fromUnit} onValueChange={setFromUnit}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(category.units).map(([unit, { name }]) => (
                              <SelectItem key={unit} value={unit}>
                                {unit} - {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-center">
                        <Button variant="outline" size="sm" onClick={swapUnits}>
                          <ArrowRightLeft className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label>To</Label>
                        <Select value={toUnit} onValueChange={setToUnit}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(category.units).map(([unit, { name }]) => (
                              <SelectItem key={unit} value={unit}>
                                {unit} - {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={performConversion} className="bg-green-600 hover:bg-green-700">
                        Convert
                      </Button>
                    </div>

                    {/* Result */}
                    <div className="bg-muted p-6 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground mb-2">Conversion Result</p>
                      <p className="text-3xl font-bold">
                        {amount} {fromUnit} = {result.toFixed(6)} {toUnit}
                      </p>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Conversion Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Conversion Reference</CardTitle>
                  <CardDescription>Quick reference for all supported units</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={exportToPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline" onClick={exportToJPEG}>
                    <FileImage className="w-4 h-4 mr-2" />
                    Export JPEG
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div id="conversion-reference" className="bg-background p-4 rounded-lg">
                <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="length">Length</TabsTrigger>
                    <TabsTrigger value="weight">Weight</TabsTrigger>
                    <TabsTrigger value="volume">Volume</TabsTrigger>
                    <TabsTrigger value="area">Area</TabsTrigger>
                  </TabsList>

                  {Object.entries(conversions).map(([categoryKey, category]) => (
                    <TabsContent key={categoryKey} value={categoryKey}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Unit</th>
                              <th className="text-left p-2">Full Name</th>
                              <th className="text-right p-2">Conversion Factor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(category.units).map(([unit, { name, factor }]) => (
                              <tr key={unit} className="border-b hover:bg-muted/50">
                                <td className="p-2 font-mono font-bold">{unit}</td>
                                <td className="p-2">{name}</td>
                                <td className="text-right p-2 font-mono">{factor.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Conversion History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Conversion History</CardTitle>
                  <Button variant="outline" onClick={clearHistory}>
                    Clear History
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date & Time</th>
                        <th className="text-left p-2">Category</th>
                        <th className="text-right p-2">From</th>
                        <th className="text-right p-2">To</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 10).map((conversion) => (
                        <tr key={conversion.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">{new Date(conversion.timestamp).toLocaleString()}</td>
                          <td className="p-2 capitalize">{conversion.category}</td>
                          <td className="text-right p-2">
                            {conversion.amount} {conversion.fromUnit}
                          </td>
                          <td className="text-right p-2">
                            {conversion.result.toFixed(6)} {conversion.toUnit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {history.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center py-12"
          >
            <Ruler className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Conversions Yet</h3>
            <p className="text-muted-foreground">
              Perform your first unit conversion to start building your conversion history.
            </p>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  )
}

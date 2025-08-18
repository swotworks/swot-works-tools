"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  FileText,
  Plus,
  Trash2,
  Menu,
  X,
  CreditCard,
  GripVertical,
  Palette,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle,
  Shield,
  PieChart,
  BarChart,
  LineChart,
  Save,
  Eye,
  Share2,
  Search,
  RefreshCw,
  Settings,
  Star,
  Award,
  Zap,
  Globe,
  Phone,
  Building,
  Clock,
  Camera,
  Printer,
  FileImage,
  Briefcase,
  Activity,
  CheckCircle,
  Info,
  ArrowUp,
  ArrowDown,
  ArrowRight,
} from "lucide-react"

interface SwotEntry {
  id: string
  type: "strength" | "weakness" | "opportunity" | "threat"
  text: string
  priority: "high" | "medium" | "low"
  category: string
  impact: number
  likelihood?: number
  createdAt: string
  tags: string[]
}

interface SwotAnalysis {
  id: string
  title: string
  description: string
  entries: SwotEntry[]
  createdAt: string
  lastModified: string
  template: string
}

interface BusinessCardTemplate {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    background: string
  }
  layout: "modern" | "classic" | "minimal" | "creative"
}

interface DokanData {
  businessName: string
  tagline: string
  description: string
  logo: string
  phone: string
  email: string
  address: string
  website: string
  socialMedia: {
    facebook: string
    instagram: string
    twitter: string
    linkedin: string
    youtube: string
  }
  businessType: string
  established: string
  services: string[]
  workingHours: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  template: string
}

interface ExpenseCategory {
  id: string
  name: string
  budget: number
  spent: number
  color: string
}

interface Task {
  id: string
  title: string
  completed: boolean
  priority: "high" | "medium" | "low"
  dueDate: string
}

interface DainikData {
  id: string
  date: string
  revenue: string
  expenses: string
  customers: string
  currency: string
  notes: string
  categories: ExpenseCategory[]
  tasks: Task[]
  goals: {
    dailyRevenue: number
    dailyCustomers: number
    monthlyRevenue: number
  }
  metrics: {
    conversionRate: number
    averageOrderValue: number
    customerSatisfaction: number
  }
  weather: string
  mood: "excellent" | "good" | "average" | "poor"
}

const currencies = [
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", flag: "🇵🇰" },
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
]

const businessCardTemplates: BusinessCardTemplate[] = [
  {
    id: "modern",
    name: "Modern Professional",
    colors: {
      primary: "#164e63",
      secondary: "#f97316",
      accent: "#0891b2",
      text: "#ffffff",
      background: "linear-gradient(135deg, #164e63 0%, #0891b2 100%)",
    },
    layout: "modern",
  },
  {
    id: "classic",
    name: "Classic Business",
    colors: {
      primary: "#1f2937",
      secondary: "#f59e0b",
      accent: "#6b7280",
      text: "#ffffff",
      background: "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
    },
    layout: "classic",
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    colors: {
      primary: "#ffffff",
      secondary: "#164e63",
      accent: "#f97316",
      text: "#164e63",
      background: "#ffffff",
    },
    layout: "minimal",
  },
  {
    id: "creative",
    name: "Creative Bold",
    colors: {
      primary: "#7c3aed",
      secondary: "#f97316",
      accent: "#06b6d4",
      text: "#ffffff",
      background: "linear-gradient(135deg, #7c3aed 0%, #f97316 50%, #06b6d4 100%)",
    },
    layout: "creative",
  },
]

export default function SwotWorksToolkit() {
  const [activeTab, setActiveTab] = useState("swot")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [swotAnalyses, setSwotAnalyses] = useState<SwotAnalysis[]>([])
  const [currentAnalysis, setCurrentAnalysis] = useState<SwotAnalysis | null>(null)
  const [newEntry, setNewEntry] = useState("")
  const [entryType, setEntryType] = useState<SwotEntry["type"]>("strength")
  const [entryPriority, setEntryPriority] = useState<SwotEntry["priority"]>("medium")
  const [entryCategory, setEntryCategory] = useState("")
  const [entryImpact, setEntryImpact] = useState(5)
  const [draggedEntry, setDraggedEntry] = useState<SwotEntry | null>(null)
  const [swotFilter, setSwotFilter] = useState<string>("all")
  const [swotSearch, setSwotSearch] = useState("")

  const [dokanData, setDokanData] = useState<DokanData>({
    businessName: "",
    tagline: "",
    description: "",
    logo: "",
    phone: "",
    email: "",
    address: "",
    website: "",
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: "",
    },
    businessType: "",
    established: "",
    services: [],
    workingHours: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "10:00 AM - 4:00 PM",
      sunday: "Closed",
    },
    template: "modern",
  })
  const [selectedTemplate, setSelectedTemplate] = useState<BusinessCardTemplate>(businessCardTemplates[0])

  const [dainikData, setDainikData] = useState<DainikData>({
    id: "",
    date: new Date().toISOString().split("T")[0],
    revenue: "",
    expenses: "",
    customers: "",
    currency: "PKR",
    notes: "",
    categories: [
      { id: "1", name: "Marketing", budget: 1000, spent: 0, color: "#f97316" },
      { id: "2", name: "Operations", budget: 2000, spent: 0, color: "#0891b2" },
      { id: "3", name: "Sales", budget: 1500, spent: 0, color: "#10b981" },
      { id: "4", name: "Other", budget: 500, spent: 0, color: "#8b5cf6" },
    ],
    tasks: [],
    goals: {
      dailyRevenue: 5000,
      dailyCustomers: 10,
      monthlyRevenue: 150000,
    },
    metrics: {
      conversionRate: 0,
      averageOrderValue: 0,
      customerSatisfaction: 0,
    },
    weather: "",
    mood: "good",
  })
  const [reportHistory, setReportHistory] = useState<DainikData[]>([])
  const [reportGenerated, setReportGenerated] = useState(false)
  const [activeReportTab, setActiveReportTab] = useState("overview")

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSwotAnalyses = localStorage.getItem("swot-analyses")
    if (savedSwotAnalyses) {
      const analyses = JSON.parse(savedSwotAnalyses)
      setSwotAnalyses(analyses)
      if (analyses.length > 0) {
        setCurrentAnalysis(analyses[0])
      }
    }

    const savedDokanData = localStorage.getItem("dokan-data")
    if (savedDokanData) {
      setDokanData(JSON.parse(savedDokanData))
    }

    const savedReportHistory = localStorage.getItem("report-history")
    if (savedReportHistory) {
      setReportHistory(JSON.parse(savedReportHistory))
    }
  }, [])

  const saveSwotData = (analyses: SwotAnalysis[]) => {
    localStorage.setItem("swot-analyses", JSON.stringify(analyses))
  }

  const saveDokanData = (data: DokanData) => {
    localStorage.setItem("dokan-data", JSON.stringify(data))
  }

  const saveReportHistory = (history: DainikData[]) => {
    localStorage.setItem("report-history", JSON.stringify(history))
  }

  const createNewAnalysis = () => {
    const newAnalysis: SwotAnalysis = {
      id: Date.now().toString(),
      title: "New SWOT Analysis",
      description: "",
      entries: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      template: "business",
    }
    const updatedAnalyses = [newAnalysis, ...swotAnalyses]
    setSwotAnalyses(updatedAnalyses)
    setCurrentAnalysis(newAnalysis)
    saveSwotData(updatedAnalyses)
  }

  const addSwotEntry = () => {
    if (!newEntry.trim() || !currentAnalysis) return

    const entry: SwotEntry = {
      id: Date.now().toString(),
      type: entryType,
      text: newEntry.trim(),
      priority: entryPriority,
      category: entryCategory || "General",
      impact: entryImpact,
      likelihood: entryType === "opportunity" || entryType === "threat" ? 5 : undefined,
      createdAt: new Date().toISOString(),
      tags: [],
    }

    const updatedAnalysis = {
      ...currentAnalysis,
      entries: [...currentAnalysis.entries, entry],
      lastModified: new Date().toISOString(),
    }

    const updatedAnalyses = swotAnalyses.map((analysis) =>
      analysis.id === currentAnalysis.id ? updatedAnalysis : analysis,
    )

    setSwotAnalyses(updatedAnalyses)
    setCurrentAnalysis(updatedAnalysis)
    saveSwotData(updatedAnalyses)
    setNewEntry("")
    setEntryCategory("")
  }

  const deleteSwotEntry = (id: string) => {
    if (!currentAnalysis) return

    const updatedAnalysis = {
      ...currentAnalysis,
      entries: currentAnalysis.entries.filter((entry) => entry.id !== id),
      lastModified: new Date().toISOString(),
    }

    const updatedAnalyses = swotAnalyses.map((analysis) =>
      analysis.id === currentAnalysis.id ? updatedAnalysis : analysis,
    )

    setSwotAnalyses(updatedAnalyses)
    setCurrentAnalysis(updatedAnalysis)
    saveSwotData(updatedAnalyses)
  }

  const handleDragStart = (entry: SwotEntry) => {
    setDraggedEntry(entry)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetType: SwotEntry["type"]) => {
    e.preventDefault()
    if (!draggedEntry || !currentAnalysis) return

    if (draggedEntry.type !== targetType) {
      const updatedAnalysis = {
        ...currentAnalysis,
        entries: currentAnalysis.entries.map((entry) =>
          entry.id === draggedEntry.id ? { ...entry, type: targetType } : entry,
        ),
        lastModified: new Date().toISOString(),
      }

      const updatedAnalyses = swotAnalyses.map((analysis) =>
        analysis.id === currentAnalysis.id ? updatedAnalysis : analysis,
      )

      setSwotAnalyses(updatedAnalyses)
      setCurrentAnalysis(updatedAnalysis)
      saveSwotData(updatedAnalyses)
    }
    setDraggedEntry(null)
  }

  const getEntriesByType = (type: SwotEntry["type"]) => {
    if (!currentAnalysis) return []
    let entries = currentAnalysis.entries.filter((entry) => entry.type === type)

    if (swotSearch) {
      entries = entries.filter(
        (entry) =>
          entry.text.toLowerCase().includes(swotSearch.toLowerCase()) ||
          entry.category.toLowerCase().includes(swotSearch.toLowerCase()),
      )
    }

    if (swotFilter !== "all") {
      entries = entries.filter((entry) => entry.priority === swotFilter)
    }

    return entries
  }

  const generateBusinessCard = (template: BusinessCardTemplate) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size for high resolution (300 DPI)
    canvas.width = 1050 // 3.5 inches * 300 DPI
    canvas.height = 600 // 2 inches * 300 DPI

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply template-specific styling
    if (template.layout === "modern") {
      // Modern gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, template.colors.primary)
      gradient.addColorStop(1, template.colors.accent)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Decorative elements
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
      ctx.beginPath()
      ctx.arc(canvas.width - 100, 100, 80, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(100, canvas.height - 100, 60, 0, Math.PI * 2)
      ctx.fill()
    } else if (template.layout === "minimal") {
      // Clean white background with accent line
      ctx.fillStyle = template.colors.background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = template.colors.secondary
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else if (template.layout === "creative") {
      // Creative multi-color background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, template.colors.primary)
      gradient.addColorStop(0.5, template.colors.secondary)
      gradient.addColorStop(1, template.colors.accent)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Creative shapes
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)"
      ctx.beginPath()
      ctx.moveTo(canvas.width - 200, 0)
      ctx.lineTo(canvas.width, 0)
      ctx.lineTo(canvas.width, 200)
      ctx.closePath()
      ctx.fill()
    } else {
      // Classic professional background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
      gradient.addColorStop(0, template.colors.primary)
      gradient.addColorStop(1, template.colors.secondary)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Business name
    ctx.fillStyle = template.colors.text
    ctx.font = "bold 48px Montserrat, Arial, sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(dokanData.businessName || "Business Name", 50, 100)

    // Tagline
    ctx.fillStyle = template.layout === "minimal" ? template.colors.primary : "rgba(255, 255, 255, 0.9)"
    ctx.font = "24px Open Sans, Arial, sans-serif"
    ctx.fillText(dokanData.tagline || "Your Business Tagline", 50, 140)

    // Contact information with icons
    ctx.fillStyle = template.colors.text
    ctx.font = "20px Open Sans, Arial, sans-serif"
    let yPos = 220

    if (dokanData.phone) {
      ctx.fillText(`📞 ${dokanData.phone}`, 50, yPos)
      yPos += 35
    }

    if (dokanData.email) {
      ctx.fillText(`✉️ ${dokanData.email}`, 50, yPos)
      yPos += 35
    }

    if (dokanData.website) {
      ctx.fillText(`🌐 ${dokanData.website}`, 50, yPos)
      yPos += 35
    }

    // Address with word wrapping
    if (dokanData.address) {
      ctx.fillStyle = template.layout === "minimal" ? template.colors.primary : "rgba(255, 255, 255, 0.8)"
      ctx.font = "18px Open Sans, Arial, sans-serif"
      const words = dokanData.address.split(" ")
      let line = ""
      const lineHeight = 25

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " "
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > 400 && i > 0) {
          ctx.fillText(line, 50, yPos)
          line = words[i] + " "
          yPos += lineHeight
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, 50, yPos)
    }

    // Business type badge
    if (dokanData.businessType) {
      const badgeWidth = 200
      const badgeHeight = 40
      const badgeX = canvas.width - badgeWidth - 50
      const badgeY = 50

      ctx.fillStyle = template.layout === "minimal" ? template.colors.secondary : "rgba(255, 255, 255, 0.2)"
      ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight)

      ctx.fillStyle = template.colors.text
      ctx.font = "16px Open Sans, Arial, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(dokanData.businessType, badgeX + badgeWidth / 2, badgeY + 25)
    }

    // Established year
    if (dokanData.established) {
      ctx.fillStyle = template.layout === "minimal" ? template.colors.primary : "rgba(255, 255, 255, 0.7)"
      ctx.font = "14px Open Sans, Arial, sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(`Est. ${dokanData.established}`, canvas.width - 50, canvas.height - 30)
    }

    // QR Code placeholder (for future implementation)
    if (dokanData.website) {
      const qrSize = 80
      const qrX = canvas.width - qrSize - 50
      const qrY = canvas.height - qrSize - 50

      ctx.fillStyle = template.layout === "minimal" ? template.colors.primary : "rgba(255, 255, 255, 0.9)"
      ctx.fillRect(qrX, qrY, qrSize, qrSize)

      ctx.fillStyle = template.layout === "minimal" ? "white" : template.colors.primary
      ctx.font = "10px Arial, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("QR", qrX + qrSize / 2, qrY + qrSize / 2)
    }
  }

  const exportAsJPEG = () => {
    generateBusinessCard(selectedTemplate)
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `${dokanData.businessName || "business"}-card-${selectedTemplate.name.toLowerCase().replace(" ", "-")}.jpg`
    link.href = canvas.toDataURL("image/jpeg", 1.0)
    link.click()
  }

  const exportAsPDF = () => {
    generateBusinessCard(selectedTemplate)
    const canvas = canvasRef.current
    if (!canvas) return

    // For a real PDF export, you would use a library like jsPDF
    const link = document.createElement("a")
    link.download = `${dokanData.businessName || "business"}-card-${selectedTemplate.name.toLowerCase().replace(" ", "-")}.pdf`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const generateReport = () => {
    const newReport: DainikData = {
      ...dainikData,
      id: Date.now().toString(),
    }
    const updatedHistory = [newReport, ...reportHistory.slice(0, 29)] // Keep last 30 reports
    setReportHistory(updatedHistory)
    saveReportHistory(updatedHistory)
    setReportGenerated(true)
  }

  const calculateNetProfit = () => {
    const revenue = Number.parseFloat(dainikData.revenue) || 0
    const expenses = Number.parseFloat(dainikData.expenses) || 0
    return revenue - expenses
  }

  const calculateCategoryTotal = () => {
    return dainikData.categories.reduce((total, category) => total + category.spent, 0)
  }

  const getCurrentCurrency = () => {
    return currencies.find((c) => c.code === dainikData.currency) || currencies[0]
  }

  const calculateGoalProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }

  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: "",
      completed: false,
      priority: "medium",
      dueDate: dainikData.date,
    }
    setDainikData({
      ...dainikData,
      tasks: [...dainikData.tasks, newTask],
    })
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setDainikData({
      ...dainikData,
      tasks: dainikData.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
    })
  }

  const deleteTask = (id: string) => {
    setDainikData({
      ...dainikData,
      tasks: dainikData.tasks.filter((task) => task.id !== id),
    })
  }

  const navigationItems = [
    { id: "swot", label: "SWOT Analyzer", icon: BarChart3, description: "Strategic Analysis" },
    { id: "dokan", label: "Business Cards", icon: CreditCard, description: "Professional Cards" },
    { id: "dainik", label: "Daily Reports", icon: FileText, description: "Business Analytics" },
  ]

  const renderSwotAnalyzer = () => (
    <div className="space-y-6">
      {/* Analysis Header */}
      <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{currentAnalysis?.title || "SWOT Analysis"}</CardTitle>
              <p className="text-primary-foreground/80 mt-2">Strategic analysis for informed decision making</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={createNewAnalysis}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Control Panel */}
        <Card className="lg:col-span-1 bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5" />
              Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search Entries</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={swotSearch}
                  onChange={(e) => setSwotSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Priority</label>
              <Select value={swotFilter} onValueChange={setSwotFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Add Entry Form */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium">Add New Entry</h4>

              <Textarea
                placeholder="Describe your analysis point..."
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                className="min-h-[80px]"
              />

              <div className="grid grid-cols-2 gap-2">
                <Select value={entryType} onValueChange={(value: SwotEntry["type"]) => setEntryType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">💪 Strength</SelectItem>
                    <SelectItem value="weakness">⚠️ Weakness</SelectItem>
                    <SelectItem value="opportunity">🚀 Opportunity</SelectItem>
                    <SelectItem value="threat">⚡ Threat</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={entryPriority} onValueChange={(value: SwotEntry["priority"]) => setEntryPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Category (optional)"
                value={entryCategory}
                onChange={(e) => setEntryCategory(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium mb-2">Impact Level: {entryImpact}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={entryImpact}
                  onChange={(e) => setEntryImpact(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <Button onClick={addSwotEntry} className="w-full" disabled={!newEntry.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SWOT Matrix */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <Card
            className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "strength")}
          >
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Strengths
                </div>
                <Badge variant="secondary" className="bg-white text-green-600">
                  {getEntriesByType("strength").length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 min-h-[300px] pt-4">
              {getEntriesByType("strength").map((entry) => (
                <div
                  key={entry.id}
                  className="group flex items-start justify-between p-3 bg-white rounded-lg shadow-sm border border-green-200 cursor-move hover:shadow-md transition-all duration-200"
                  draggable
                  onDragStart={() => handleDragStart(entry)}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <GripVertical className="w-4 h-4 text-green-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1">
                      <p className="text-sm text-green-800 font-medium">{entry.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            entry.priority === "high"
                              ? "border-red-300 text-red-600"
                              : entry.priority === "medium"
                                ? "border-yellow-300 text-yellow-600"
                                : "border-green-300 text-green-600"
                          }`}
                        >
                          {entry.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-green-300 text-green-600">
                          Impact: {entry.impact}/10
                        </Badge>
                        {entry.category && (
                          <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                            {entry.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSwotEntry(entry.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {getEntriesByType("strength").length === 0 && (
                <div className="text-center text-green-400 py-12 border-2 border-dashed border-green-200 rounded-lg">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Drop strength items here or add them using the form</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weaknesses */}
          <Card
            className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 hover:shadow-lg transition-shadow"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "weakness")}
          >
            <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Weaknesses
                </div>
                <Badge variant="secondary" className="bg-white text-red-600">
                  {getEntriesByType("weakness").length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 min-h-[300px] pt-4">
              {getEntriesByType("weakness").map((entry) => (
                <div
                  key={entry.id}
                  className="group flex items-start justify-between p-3 bg-white rounded-lg shadow-sm border border-red-200 cursor-move hover:shadow-md transition-all duration-200"
                  draggable
                  onDragStart={() => handleDragStart(entry)}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <GripVertical className="w-4 h-4 text-red-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1">
                      <p className="text-sm text-red-800 font-medium">{entry.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            entry.priority === "high"
                              ? "border-red-300 text-red-600"
                              : entry.priority === "medium"
                                ? "border-yellow-300 text-yellow-600"
                                : "border-green-300 text-green-600"
                          }`}
                        >
                          {entry.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-red-300 text-red-600">
                          Impact: {entry.impact}/10
                        </Badge>
                        {entry.category && (
                          <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                            {entry.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSwotEntry(entry.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {getEntriesByType("weakness").length === 0 && (
                <div className="text-center text-red-400 py-12 border-2 border-dashed border-red-200 rounded-lg">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Drop weakness items here or add them using the form</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card
            className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-lg transition-shadow"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "opportunity")}
          >
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Opportunities
                </div>
                <Badge variant="secondary" className="bg-white text-blue-600">
                  {getEntriesByType("opportunity").length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 min-h-[300px] pt-4">
              {getEntriesByType("opportunity").map((entry) => (
                <div
                  key={entry.id}
                  className="group flex items-start justify-between p-3 bg-white rounded-lg shadow-sm border border-blue-200 cursor-move hover:shadow-md transition-all duration-200"
                  draggable
                  onDragStart={() => handleDragStart(entry)}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <GripVertical className="w-4 h-4 text-blue-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 font-medium">{entry.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            entry.priority === "high"
                              ? "border-red-300 text-red-600"
                              : entry.priority === "medium"
                                ? "border-yellow-300 text-yellow-600"
                                : "border-green-300 text-green-600"
                          }`}
                        >
                          {entry.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-blue-300 text-blue-600">
                          Impact: {entry.impact}/10
                        </Badge>
                        {entry.category && (
                          <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                            {entry.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSwotEntry(entry.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {getEntriesByType("opportunity").length === 0 && (
                <div className="text-center text-blue-400 py-12 border-2 border-dashed border-blue-200 rounded-lg">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Drop opportunity items here or add them using the form</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Threats */}
          <Card
            className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 hover:shadow-lg transition-shadow"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "threat")}
          >
            <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Threats
                </div>
                <Badge variant="secondary" className="bg-white text-orange-600">
                  {getEntriesByType("threat").length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 min-h-[300px] pt-4">
              {getEntriesByType("threat").map((entry) => (
                <div
                  key={entry.id}
                  className="group flex items-start justify-between p-3 bg-white rounded-lg shadow-sm border border-orange-200 cursor-move hover:shadow-md transition-all duration-200"
                  draggable
                  onDragStart={() => handleDragStart(entry)}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <GripVertical className="w-4 h-4 text-orange-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1">
                      <p className="text-sm text-orange-800 font-medium">{entry.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            entry.priority === "high"
                              ? "border-red-300 text-red-600"
                              : entry.priority === "medium"
                                ? "border-yellow-300 text-yellow-600"
                                : "border-green-300 text-green-600"
                          }`}
                        >
                          {entry.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                          Impact: {entry.impact}/10
                        </Badge>
                        {entry.category && (
                          <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                            {entry.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSwotEntry(entry.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {getEntriesByType("threat").length === 0 && (
                <div className="text-center text-orange-400 py-12 border-2 border-dashed border-orange-200 rounded-lg">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Drop threat items here or add them using the form</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analysis Summary */}
      {currentAnalysis && currentAnalysis.entries.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <PieChart className="w-5 h-5" />
              Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">{getEntriesByType("strength").length}</div>
                <div className="text-sm text-muted-foreground">Strengths</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-red-600">{getEntriesByType("weakness").length}</div>
                <div className="text-sm text-muted-foreground">Weaknesses</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{getEntriesByType("opportunity").length}</div>
                <div className="text-sm text-muted-foreground">Opportunities</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-orange-600">{getEntriesByType("threat").length}</div>
                <div className="text-sm text-muted-foreground">Threats</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderDokanBuilder = () => (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Professional Business Card Builder
          </CardTitle>
          <p className="text-primary-foreground/80">
            Create stunning business cards with multiple templates and export in HD formats
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Information Form */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Business Name *</label>
                      <Input
                        placeholder="Enter your business name"
                        value={dokanData.businessName}
                        onChange={(e) => {
                          const updatedData = { ...dokanData, businessName: e.target.value }
                          setDokanData(updatedData)
                          saveDokanData(updatedData)
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Business Type</label>
                      <Select
                        value={dokanData.businessType}
                        onValueChange={(value) => {
                          const updatedData = { ...dokanData, businessType: value }
                          setDokanData(updatedData)
                          saveDokanData(updatedData)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">🛍️ Retail</SelectItem>
                          <SelectItem value="service">🔧 Service</SelectItem>
                          <SelectItem value="restaurant">🍽️ Restaurant</SelectItem>
                          <SelectItem value="technology">💻 Technology</SelectItem>
                          <SelectItem value="healthcare">🏥 Healthcare</SelectItem>
                          <SelectItem value="education">🎓 Education</SelectItem>
                          <SelectItem value="consulting">💼 Consulting</SelectItem>
                          <SelectItem value="finance">💰 Finance</SelectItem>
                          <SelectItem value="other">📋 Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Business Tagline</label>
                    <Input
                      placeholder="Your compelling business tagline"
                      value={dokanData.tagline}
                      onChange={(e) => {
                        const updatedData = { ...dokanData, tagline: e.target.value }
                        setDokanData(updatedData)
                        saveDokanData(updatedData)
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Business Description</label>
                    <Textarea
                      placeholder="Brief description of your business"
                      value={dokanData.description}
                      onChange={(e) => {
                        const updatedData = { ...dokanData, description: e.target.value }
                        setDokanData(updatedData)
                        saveDokanData(updatedData)
                      }}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Established Year</label>
                      <Input
                        placeholder="2020"
                        value={dokanData.established}
                        onChange={(e) => {
                          const updatedData = { ...dokanData, established: e.target.value }
                          setDokanData(updatedData)
                          saveDokanData(updatedData)
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Logo URL (Optional)</label>
                      <Input
                        placeholder="https://example.com/logo.png"
                        value={dokanData.logo}
                        onChange={(e) => {
                          const updatedData = { ...dokanData, logo: e.target.value }
                          setDokanData(updatedData)
                          saveDokanData(updatedData)
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <Input
                        placeholder="+92 300 1234567"
                        value={dokanData.phone}
                        onChange={(e) => {
                          const updatedData = { ...dokanData, phone: e.target.value }
                          setDokanData(updatedData)
                          saveDokanData(updatedData)
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <Input
                        placeholder="business@example.com"
                        type="email"
                        value={dokanData.email}
                        onChange={(e) => {
                          const updatedData = { ...dokanData, email: e.target.value }
                          setDokanData(updatedData)
                          saveDokanData(updatedData)
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <Input
                      placeholder="www.yourbusiness.com"
                      value={dokanData.website}
                      onChange={(e) => {
                        const updatedData = { ...dokanData, website: e.target.value }
                        setDokanData(updatedData)
                        saveDokanData(updatedData)
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Business Address</label>
                    <Textarea
                      placeholder="Your complete business address"
                      value={dokanData.address}
                      onChange={(e) => {
                        const updatedData = { ...dokanData, address: e.target.value }
                        setDokanData(updatedData)
                        saveDokanData(updatedData)
                      }}
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Social Media Profiles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Facebook</label>
                      <Input
                        placeholder="facebook.com/yourbusiness"
                        value={dokanData.socialMedia.facebook}
                        onChange={(e) => {
                          const updatedData = {
                            ...dokanData,
                            socialMedia: { ...dokanData.socialMedia, facebook: e.target.value },
                          }
                          setDokanData(updatedData)
                          saveDokanData(updatedData)
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Instagram</label>
                      <Input
                        placeholder="@yourbusiness"
                        value={dokanData.socialMedia.instagram}
                        onChange={(e) => {
                          const updatedData = {
                            ...dokanData,
                            socialMedia: { ...dokanData.socialMedia, instagram: e.target.value },
                          }
                          setDokanData(updatedData)
                          saveDokanData(updatedData)
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Twitter</label>
                      <Input
                        placeholder="@yourbusiness"
                        value={dokanData.socialMedia.twitter}
                        onChange={(e) => {
                          const updatedData = {
                            ...dokanData,
                            socialMedia: { ...dokanData.socialMedia, twitter: e.target.value },
                          }
                          setDokanData(updatedData)
                          saveDokanData(updatedData)
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">LinkedIn</label>
                      <Input
                        placeholder="linkedin.com/company/yourbusiness"
                        value={dokanData.socialMedia.linkedin}
                        onChange={(e) => {
                          const updatedData = {
                            ...dokanData,
                            socialMedia: { ...dokanData.socialMedia, linkedin: e.target.value },
                          }
                          setDokanData(updatedData)
                          saveDokanData(updatedData)
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">YouTube</label>
                      <Input
                        placeholder="youtube.com/c/yourbusiness"
                        value={dokanData.socialMedia.youtube}
                        onChange={(e) => {
                          const updatedData = {
                            ...dokanData,
                            socialMedia: { ...dokanData.socialMedia, youtube: e.target.value },
                          }
                          setDokanData(updatedData)
                          saveDokanData(updatedData)
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Services & Working Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Services Offered</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add a service"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            const input = e.target as HTMLInputElement
                            if (input.value.trim()) {
                              const updatedData = {
                                ...dokanData,
                                services: [...dokanData.services, input.value.trim()],
                              }
                              setDokanData(updatedData)
                              saveDokanData(updatedData)
                              input.value = ""
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                          if (input.value.trim()) {
                            const updatedData = {
                              ...dokanData,
                              services: [...dokanData.services, input.value.trim()],
                            }
                            setDokanData(updatedData)
                            saveDokanData(updatedData)
                            input.value = ""
                          }
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dokanData.services.map((service, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => {
                            const updatedData = {
                              ...dokanData,
                              services: dokanData.services.filter((_, i) => i !== index),
                            }
                            setDokanData(updatedData)
                            saveDokanData(updatedData)
                          }}
                        >
                          {service} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Working Hours</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(dokanData.workingHours).map(([day, hours]) => (
                        <div key={day} className="flex items-center gap-2">
                          <span className="w-20 text-sm font-medium capitalize">{day}:</span>
                          <Input
                            value={hours}
                            onChange={(e) => {
                              const updatedData = {
                                ...dokanData,
                                workingHours: { ...dokanData.workingHours, [day]: e.target.value },
                              }
                              setDokanData(updatedData)
                              saveDokanData(updatedData)
                            }}
                            className="text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Template Selection & Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Card Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {businessCardTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTemplate.id === template.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="w-full h-16 rounded mb-2" style={{ background: template.colors.background }} />
                    <div className="text-xs font-medium">{template.name}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Export Options</h4>
                <div className="space-y-2">
                  <Button onClick={exportAsJPEG} className="w-full" disabled={!dokanData.businessName.trim()}>
                    <FileImage className="w-4 h-4 mr-2" />
                    Export as HD JPEG
                  </Button>
                  <Button
                    onClick={exportAsPDF}
                    variant="outline"
                    className="w-full bg-transparent"
                    disabled={!dokanData.businessName.trim()}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Export as PDF
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generate professional business cards in high-definition format (300 DPI)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[3.5/2] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Preview will appear here</p>
                  <p className="text-xs">Fill in business details to see preview</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden canvas for business card generation */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  )

  const renderDainikReport = () => (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Daily Business Analytics
          </CardTitle>
          <p className="text-primary-foreground/80">
            Comprehensive daily reporting with PKR currency support and advanced analytics
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeReportTab} onValueChange={setActiveReportTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Daily Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <Input
                      type="date"
                      value={dainikData.date}
                      onChange={(e) => setDainikData({ ...dainikData, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Currency</label>
                    <Select
                      value={dainikData.currency}
                      onValueChange={(value) => setDainikData({ ...dainikData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.flag} {currency.symbol} {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Business Mood</label>
                    <Select
                      value={dainikData.mood}
                      onValueChange={(value: DainikData["mood"]) => setDainikData({ ...dainikData, mood: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">🚀 Excellent</SelectItem>
                        <SelectItem value="good">😊 Good</SelectItem>
                        <SelectItem value="average">😐 Average</SelectItem>
                        <SelectItem value="poor">😞 Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Total Revenue ({getCurrentCurrency().symbol})
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter today's revenue"
                      value={dainikData.revenue}
                      onChange={(e) => setDainikData({ ...dainikData, revenue: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Total Expenses ({getCurrentCurrency().symbol})
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter today's expenses"
                      value={dainikData.expenses}
                      onChange={(e) => setDainikData({ ...dainikData, expenses: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">New Customers</label>
                    <Input
                      type="number"
                      placeholder="New customers today"
                      value={dainikData.customers}
                      onChange={(e) => setDainikData({ ...dainikData, customers: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Daily Notes</label>
                  <Textarea
                    placeholder="Add notes about today's business activities, challenges, achievements..."
                    value={dainikData.notes}
                    onChange={(e) => setDainikData({ ...dainikData, notes: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Net Profit</span>
                    </div>
                    <span className="font-bold text-green-600">
                      {getCurrentCurrency().symbol}
                      {calculateNetProfit().toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Revenue</span>
                    </div>
                    <span className="font-bold text-blue-600">
                      {getCurrentCurrency().symbol}
                      {Number.parseFloat(dainikData.revenue || "0").toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium">Expenses</span>
                    </div>
                    <span className="font-bold text-red-600">
                      {getCurrentCurrency().symbol}
                      {Number.parseFloat(dainikData.expenses || "0").toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Customers</span>
                    </div>
                    <span className="font-bold text-purple-600">{dainikData.customers || "0"}</span>
                  </div>
                </div>

                <Button onClick={generateReport} className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Expense Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dainikData.categories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {getCurrentCurrency().symbol}
                        {category.spent} / {getCurrentCurrency().symbol}
                        {category.budget}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Amount spent"
                        value={category.spent}
                        onChange={(e) => {
                          const updatedCategories = dainikData.categories.map((cat) =>
                            cat.id === category.id ? { ...cat, spent: Number.parseFloat(e.target.value) || 0 } : cat,
                          )
                          setDainikData({ ...dainikData, categories: updatedCategories })
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Budget"
                        value={category.budget}
                        onChange={(e) => {
                          const updatedCategories = dainikData.categories.map((cat) =>
                            cat.id === category.id ? { ...cat, budget: Number.parseFloat(e.target.value) || 0 } : cat,
                          )
                          setDainikData({ ...dainikData, categories: updatedCategories })
                        }}
                      />
                    </div>
                    <Progress value={(category.spent / category.budget) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Goals & Targets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Goals & Targets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Daily Revenue Goal</label>
                    <Input
                      type="number"
                      value={dainikData.goals.dailyRevenue}
                      onChange={(e) =>
                        setDainikData({
                          ...dainikData,
                          goals: { ...dainikData.goals, dailyRevenue: Number.parseFloat(e.target.value) || 0 },
                        })
                      }
                    />
                    <Progress
                      value={calculateGoalProgress(
                        Number.parseFloat(dainikData.revenue || "0"),
                        dainikData.goals.dailyRevenue,
                      )}
                      className="h-2 mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Daily Customer Goal</label>
                    <Input
                      type="number"
                      value={dainikData.goals.dailyCustomers}
                      onChange={(e) =>
                        setDainikData({
                          ...dainikData,
                          goals: { ...dainikData.goals, dailyCustomers: Number.parseFloat(e.target.value) || 0 },
                        })
                      }
                    />
                    <Progress
                      value={calculateGoalProgress(
                        Number.parseFloat(dainikData.customers || "0"),
                        dainikData.goals.dailyCustomers,
                      )}
                      className="h-2 mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Monthly Revenue Goal</label>
                    <Input
                      type="number"
                      value={dainikData.goals.monthlyRevenue}
                      onChange={(e) =>
                        setDainikData({
                          ...dainikData,
                          goals: { ...dainikData.goals, monthlyRevenue: Number.parseFloat(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Daily Tasks
                </CardTitle>
                <Button onClick={addTask} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {dainikData.tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => updateTask(task.id, { completed: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Input
                    placeholder="Task description"
                    value={task.title}
                    onChange={(e) => updateTask(task.id, { title: e.target.value })}
                    className={task.completed ? "line-through text-muted-foreground" : ""}
                  />
                  <Select
                    value={task.priority}
                    onValueChange={(value: Task["priority"]) => updateTask(task.id, { priority: value })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">🔴 High</SelectItem>
                      <SelectItem value="medium">🟡 Med</SelectItem>
                      <SelectItem value="low">🟢 Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {dainikData.tasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No tasks added yet. Click "Add Task" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Conversion Rate (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={dainikData.metrics.conversionRate}
                    onChange={(e) =>
                      setDainikData({
                        ...dainikData,
                        metrics: { ...dainikData.metrics, conversionRate: Number.parseFloat(e.target.value) || 0 },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Avg Order Value</label>
                  <Input
                    type="number"
                    value={dainikData.metrics.averageOrderValue}
                    onChange={(e) =>
                      setDainikData({
                        ...dainikData,
                        metrics: { ...dainikData.metrics, averageOrderValue: Number.parseFloat(e.target.value) || 0 },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Customer Satisfaction (1-10)</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={dainikData.metrics.customerSatisfaction}
                    onChange={(e) =>
                      setDainikData({
                        ...dainikData,
                        metrics: {
                          ...dainikData.metrics,
                          customerSatisfaction: Number.parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {dainikData.metrics.conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Conversion Rate</div>
                  </div>

                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {getCurrentCurrency().symbol}
                      {dainikData.metrics.averageOrderValue.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Order Value</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {dainikData.metrics.customerSatisfaction.toFixed(1)}/10
                    </div>
                    <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {dainikData.tasks.filter((t) => t.completed).length}/{dainikData.tasks.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Tasks Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Report History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportHistory.length > 0 ? (
                <div className="space-y-3">
                  {reportHistory.slice(0, 10).map((report, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium">{report.date}</div>
                        <Badge variant="outline">
                          {currencies.find((c) => c.code === report.currency)?.flag} {report.currency}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          Revenue: {currencies.find((c) => c.code === report.currency)?.symbol}
                          {Number.parseFloat(report.revenue || "0").toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-green-600">
                          Profit: {currencies.find((c) => c.code === report.currency)?.symbol}
                          {(
                            Number.parseFloat(report.revenue || "0") - Number.parseFloat(report.expenses || "0")
                          ).toFixed(2)}
                        </div>
                        <Badge
                          variant={
                            report.mood === "excellent"
                              ? "default"
                              : report.mood === "good"
                                ? "secondary"
                                : report.mood === "average"
                                  ? "outline"
                                  : "destructive"
                          }
                        >
                          {report.mood === "excellent" && "🚀"}
                          {report.mood === "good" && "😊"}
                          {report.mood === "average" && "😐"}
                          {report.mood === "poor" && "😞"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No reports generated yet. Create your first daily report!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Report Display */}
      {reportGenerated && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Daily Report Generated - {dainikData.date}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center bg-white p-6 rounded-lg shadow-sm border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {getCurrentCurrency().symbol}
                  {calculateNetProfit().toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Net Profit
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {calculateNetProfit() > 0 ? "📈 Profitable" : "📉 Loss"}
                </div>
              </div>

              <div className="text-center bg-white p-6 rounded-lg shadow-sm border border-green-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {getCurrentCurrency().symbol}
                  {Number.parseFloat(dainikData.revenue || "0").toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Revenue
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Goal:{" "}
                  {calculateGoalProgress(
                    Number.parseFloat(dainikData.revenue || "0"),
                    dainikData.goals.dailyRevenue,
                  ).toFixed(1)}
                  %
                </div>
              </div>

              <div className="text-center bg-white p-6 rounded-lg shadow-sm border border-green-200">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {getCurrentCurrency().symbol}
                  {Number.parseFloat(dainikData.expenses || "0").toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Expenses</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Budget: {getCurrentCurrency().symbol}
                  {calculateCategoryTotal().toFixed(2)}
                </div>
              </div>

              <div className="text-center bg-white p-6 rounded-lg shadow-sm border border-green-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">{dainikData.customers || "0"}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Users className="w-4 h-4" />
                  New Customers
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Goal:{" "}
                  {calculateGoalProgress(
                    Number.parseFloat(dainikData.customers || "0"),
                    dainikData.goals.dailyCustomers,
                  ).toFixed(1)}
                  %
                </div>
              </div>
            </div>

            {dainikData.notes && (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Daily Notes
                </h4>
                <p className="text-gray-700">{dainikData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 bg-sidebar border-r border-sidebar-border shadow-lg transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <h1 className="text-2xl font-bold font-montserrat">Swot.works</h1>
            <p className="text-sm text-primary-foreground/80 mt-1">Professional Business Toolkit</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Star className="w-3 h-3 mr-1" />
                Premium
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                v2.0
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center px-4 py-4 text-left rounded-lg transition-all duration-200 group
                    ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-sidebar-primary to-sidebar-accent text-sidebar-primary-foreground font-medium shadow-md border border-sidebar-primary/20"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm"
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                  {activeTab === item.id && <ArrowRight className="w-4 h-4 ml-2 opacity-70" />}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-xs text-sidebar-foreground/60 mb-3">Made with ❤️ for business professionals</div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-2 font-montserrat">
                  {navigationItems.find((item) => item.id === activeTab)?.label}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {activeTab === "swot" && "Strategic analysis with drag-and-drop functionality and advanced filtering"}
                  {activeTab === "dokan" && "Professional business cards with multiple templates and HD export options"}
                  {activeTab === "dainik" && "Comprehensive daily reporting with PKR currency support and analytics"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  Online
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Auto-save
                </Badge>
              </div>
            </div>
          </div>

          {activeTab === "swot" && renderSwotAnalyzer()}
          {activeTab === "dokan" && renderDokanBuilder()}
          {activeTab === "dainik" && renderDainikReport()}
        </div>
      </div>
    </div>
  )
}

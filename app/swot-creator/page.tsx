"use client"

import { useState, useEffect, useRef } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  Trash2,
  Plus,
  Target,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Star,
  FileText,
  BarChart3,
  Copy,
  TrendingDown,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SWOTItem {
  id: string
  text: string
  priority: number // 1-5 scale
  impact: number // 1-5 scale
  actionable: boolean
  tags: string[]
  createdAt: string
}

interface ActionPlan {
  id: string
  title: string
  description: string
  category: "SO" | "WO" | "ST" | "WT" // Strategic combinations
  priority: number
  timeline: string
  responsible: string
  status: "planned" | "in-progress" | "completed"
  createdAt: string
}

interface SWOTAnalysis {
  id: string
  name: string
  description: string
  template: string
  strengths: SWOTItem[]
  weaknesses: SWOTItem[]
  opportunities: SWOTItem[]
  threats: SWOTItem[]
  actionPlans: ActionPlan[]
  createdAt: string
  lastUpdated: string
}

const SWOT_TEMPLATES = [
  {
    id: "general",
    name: "General Business",
    description: "Standard SWOT analysis for any business",
  },
  {
    id: "startup",
    name: "Startup",
    description: "Focused on early-stage business challenges",
  },
  {
    id: "product",
    name: "Product Launch",
    description: "Analyzing a specific product or service",
  },
  {
    id: "competitive",
    name: "Competitive Analysis",
    description: "Market position and competition focus",
  },
  {
    id: "personal",
    name: "Personal Development",
    description: "Individual career or skill analysis",
  },
]

const TEMPLATE_PROMPTS = {
  general: {
    strengths: "Core competencies, unique value propositions, strong brand recognition...",
    weaknesses: "Resource limitations, skill gaps, operational inefficiencies...",
    opportunities: "Market trends, new technologies, partnership possibilities...",
    threats: "Competition, market changes, regulatory risks...",
  },
  startup: {
    strengths: "Innovation, agility, founder expertise, early market entry...",
    weaknesses: "Limited funding, small team, lack of brand recognition...",
    opportunities: "Emerging markets, investor interest, technology adoption...",
    threats: "Established competitors, funding challenges, market uncertainty...",
  },
  product: {
    strengths: "Unique features, quality, pricing advantage, customer feedback...",
    weaknesses: "Development costs, technical limitations, market awareness...",
    opportunities: "Market demand, distribution channels, customer segments...",
    threats: "Competitor products, technology changes, customer preferences...",
  },
  competitive: {
    strengths: "Market share, customer loyalty, operational efficiency...",
    weaknesses: "Competitive disadvantages, market positioning, resource gaps...",
    opportunities: "Competitor weaknesses, market gaps, strategic partnerships...",
    threats: "Competitor strengths, new entrants, market consolidation...",
  },
  personal: {
    strengths: "Skills, experience, network, achievements...",
    weaknesses: "Skill gaps, experience limitations, personal challenges...",
    opportunities: "Career paths, learning opportunities, industry growth...",
    threats: "Industry changes, competition, economic factors...",
  },
}

export default function SWOTCreatorPage() {
  const [analyses, setAnalyses] = useState<SWOTAnalysis[]>([])
  const [currentAnalysis, setCurrentAnalysis] = useState<SWOTAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState("analysis")
  const gridRef = useRef<HTMLDivElement>(null)

  // Form states
  const [newAnalysisForm, setNewAnalysisForm] = useState({
    name: "",
    description: "",
    template: "general",
  })

  const [newItemForm, setNewItemForm] = useState({
    category: "strengths" as keyof Pick<SWOTAnalysis, "strengths" | "weaknesses" | "opportunities" | "threats">,
    text: "",
    priority: 3,
    impact: 3,
    tags: "",
  })

  const [newActionForm, setNewActionForm] = useState({
    title: "",
    description: "",
    category: "SO" as "SO" | "WO" | "ST" | "WT",
    priority: 3,
    timeline: "",
    responsible: "",
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("swot-analyses")
    if (saved) {
      try {
        const loadedAnalyses = JSON.parse(saved)
        setAnalyses(loadedAnalyses)
        if (loadedAnalyses.length > 0) {
          setCurrentAnalysis(loadedAnalyses[0])
        }
      } catch (error) {
        console.error("Error loading SWOT analyses:", error)
      }
    }
  }, [])

  // Save data whenever analyses change
  useEffect(() => {
    if (analyses.length > 0) {
      localStorage.setItem("swot-analyses", JSON.stringify(analyses))
    }
  }, [analyses])

  const createNewAnalysis = () => {
    if (!newAnalysisForm.name.trim()) {
      setMessage("Please enter an analysis name")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    const newAnalysis: SWOTAnalysis = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: newAnalysisForm.name.trim(),
      description: newAnalysisForm.description.trim(),
      template: newAnalysisForm.template,
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
      actionPlans: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }

    setAnalyses((prev) => [newAnalysis, ...prev])
    setCurrentAnalysis(newAnalysis)
    setNewAnalysisForm({ name: "", description: "", template: "general" })
    setMessage("New SWOT analysis created!")
    setTimeout(() => setMessage(""), 3000)
  }

  const addSWOTItem = () => {
    if (!currentAnalysis || !newItemForm.text.trim()) {
      setMessage("Please enter item text")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    const newItem: SWOTItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: newItemForm.text.trim(),
      priority: newItemForm.priority,
      impact: newItemForm.impact,
      actionable: newItemForm.priority >= 4 || newItemForm.impact >= 4,
      tags: newItemForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      createdAt: new Date().toISOString(),
    }

    const updatedAnalysis = {
      ...currentAnalysis,
      [newItemForm.category]: [...currentAnalysis[newItemForm.category], newItem],
      lastUpdated: new Date().toISOString(),
    }

    setCurrentAnalysis(updatedAnalysis)
    setAnalyses((prev) => prev.map((analysis) => (analysis.id === currentAnalysis.id ? updatedAnalysis : analysis)))

    setNewItemForm({
      category: "strengths",
      text: "",
      priority: 3,
      impact: 3,
      tags: "",
    })

    setMessage("SWOT item added successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const addActionPlan = () => {
    if (!currentAnalysis || !newActionForm.title.trim()) {
      setMessage("Please enter action plan title")
      setTimeout(() => setMessage(""), 3000)
      return
    }

    const newAction: ActionPlan = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: newActionForm.title.trim(),
      description: newActionForm.description.trim(),
      category: newActionForm.category,
      priority: newActionForm.priority,
      timeline: newActionForm.timeline,
      responsible: newActionForm.responsible,
      status: "planned",
      createdAt: new Date().toISOString(),
    }

    const updatedAnalysis = {
      ...currentAnalysis,
      actionPlans: [...currentAnalysis.actionPlans, newAction],
      lastUpdated: new Date().toISOString(),
    }

    setCurrentAnalysis(updatedAnalysis)
    setAnalyses((prev) => prev.map((analysis) => (analysis.id === currentAnalysis.id ? updatedAnalysis : analysis)))

    setNewActionForm({
      title: "",
      description: "",
      category: "SO",
      priority: 3,
      timeline: "",
      responsible: "",
    })

    setMessage("Action plan added successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const deleteAnalysis = (id: string) => {
    if (window.confirm("Are you sure you want to delete this analysis?")) {
      const updatedAnalyses = analyses.filter((analysis) => analysis.id !== id)
      setAnalyses(updatedAnalyses)

      if (currentAnalysis?.id === id) {
        setCurrentAnalysis(updatedAnalyses.length > 0 ? updatedAnalyses[0] : null)
      }

      if (updatedAnalyses.length === 0) {
        localStorage.removeItem("swot-analyses")
      }

      setMessage("Analysis deleted successfully")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const duplicateAnalysis = (analysis: SWOTAnalysis) => {
    const duplicated: SWOTAnalysis = {
      ...analysis,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: `${analysis.name} (Copy)`,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }

    setAnalyses((prev) => [duplicated, ...prev])
    setCurrentAnalysis(duplicated)
    setMessage("Analysis duplicated successfully!")
    setTimeout(() => setMessage(""), 3000)
  }

  const updateActionStatus = (actionId: string, status: ActionPlan["status"]) => {
    if (!currentAnalysis) return

    const updatedAnalysis = {
      ...currentAnalysis,
      actionPlans: currentAnalysis.actionPlans.map((action) =>
        action.id === actionId ? { ...action, status } : action,
      ),
      lastUpdated: new Date().toISOString(),
    }

    setCurrentAnalysis(updatedAnalysis)
    setAnalyses((prev) => prev.map((analysis) => (analysis.id === currentAnalysis.id ? updatedAnalysis : analysis)))
  }

  const generateStrategicRecommendations = () => {
    if (!currentAnalysis) return []

    const recommendations = []

    // SO Strategies (Strengths + Opportunities)
    if (currentAnalysis.strengths.length > 0 && currentAnalysis.opportunities.length > 0) {
      recommendations.push({
        type: "SO",
        title: "Leverage Strengths for Opportunities",
        description: "Use your key strengths to capitalize on market opportunities",
        priority: "High",
      })
    }

    // WO Strategies (Weaknesses + Opportunities)
    if (currentAnalysis.weaknesses.length > 0 && currentAnalysis.opportunities.length > 0) {
      recommendations.push({
        type: "WO",
        title: "Overcome Weaknesses through Opportunities",
        description: "Address weaknesses by taking advantage of external opportunities",
        priority: "Medium",
      })
    }

    // ST Strategies (Strengths + Threats)
    if (currentAnalysis.strengths.length > 0 && currentAnalysis.threats.length > 0) {
      recommendations.push({
        type: "ST",
        title: "Use Strengths to Counter Threats",
        description: "Deploy your strengths to minimize or eliminate threats",
        priority: "High",
      })
    }

    // WT Strategies (Weaknesses + Threats)
    if (currentAnalysis.weaknesses.length > 0 && currentAnalysis.threats.length > 0) {
      recommendations.push({
        type: "WT",
        title: "Minimize Weaknesses and Threats",
        description: "Develop defensive strategies to reduce both weaknesses and threats",
        priority: "Critical",
      })
    }

    return recommendations
  }

  const downloadEnhancedPDF = async () => {
    if (!currentAnalysis) return

    setIsLoading(true)
    try {
      const jsPDF = (await import("jspdf")).default
      const autoTable = (await import("jspdf-autotable")).default

      const doc = new jsPDF()

      // Header
      doc.setFontSize(20)
      doc.setTextColor(22, 163, 74)
      doc.text("Enhanced SWOT Analysis Report", 20, 25)

      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text(currentAnalysis.name, 20, 35)

      doc.setFontSize(12)
      doc.text(`Template: ${SWOT_TEMPLATES.find((t) => t.id === currentAnalysis.template)?.name}`, 20, 45)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55)
      doc.text(`Last updated: ${new Date(currentAnalysis.lastUpdated).toLocaleDateString()}`, 20, 65)

      if (currentAnalysis.description) {
        doc.text(`Description: ${currentAnalysis.description}`, 20, 75)
      }

      let yPos = 90

      // SWOT Summary
      doc.setFontSize(16)
      doc.setTextColor(22, 163, 74)
      doc.text("SWOT Summary", 20, yPos)
      yPos += 15

      const swotSummary = [
        ["Category", "Count", "High Priority Items", "Actionable Items"],
        [
          "Strengths",
          currentAnalysis.strengths.length.toString(),
          currentAnalysis.strengths.filter((s) => s.priority >= 4).length.toString(),
          currentAnalysis.strengths.filter((s) => s.actionable).length.toString(),
        ],
        [
          "Weaknesses",
          currentAnalysis.weaknesses.length.toString(),
          currentAnalysis.weaknesses.filter((w) => w.priority >= 4).length.toString(),
          currentAnalysis.weaknesses.filter((w) => w.actionable).length.toString(),
        ],
        [
          "Opportunities",
          currentAnalysis.opportunities.length.toString(),
          currentAnalysis.opportunities.filter((o) => o.priority >= 4).length.toString(),
          currentAnalysis.opportunities.filter((o) => o.actionable).length.toString(),
        ],
        [
          "Threats",
          currentAnalysis.threats.length.toString(),
          currentAnalysis.threats.filter((t) => t.priority >= 4).length.toString(),
          currentAnalysis.threats.filter((t) => t.actionable).length.toString(),
        ],
      ]
      ;(doc as any).autoTable({
        head: [swotSummary[0]],
        body: swotSummary.slice(1),
        startY: yPos,
        theme: "grid",
        headStyles: { fillColor: [22, 163, 74] },
      })

      yPos = (doc as any).lastAutoTable.finalY + 20

      // Strategic Recommendations
      const recommendations = generateStrategicRecommendations()
      if (recommendations.length > 0) {
        if (yPos > 200) {
          doc.addPage()
          yPos = 30
        }

        doc.setFontSize(16)
        doc.setTextColor(22, 163, 74)
        doc.text("Strategic Recommendations", 20, yPos)
        yPos += 15

        recommendations.forEach((rec, index) => {
          if (yPos > 250) {
            doc.addPage()
            yPos = 30
          }

          doc.setFontSize(12)
          doc.setTextColor(0, 0, 0)
          doc.text(`${index + 1}. ${rec.title} (${rec.type} Strategy)`, 20, yPos)
          yPos += 8
          doc.setFontSize(10)
          doc.text(`Priority: ${rec.priority}`, 25, yPos)
          yPos += 6
          doc.text(rec.description, 25, yPos)
          yPos += 15
        })
      }

      // Action Plans
      if (currentAnalysis.actionPlans.length > 0) {
        if (yPos > 200) {
          doc.addPage()
          yPos = 30
        }

        doc.setFontSize(16)
        doc.setTextColor(22, 163, 74)
        doc.text("Action Plans", 20, yPos)
        yPos += 15

        const actionData = currentAnalysis.actionPlans.map((action) => [
          action.title,
          action.category,
          action.priority.toString(),
          action.status,
          action.timeline || "Not set",
          action.responsible || "Not assigned",
        ])
        ;(doc as any).autoTable({
          head: [["Title", "Strategy", "Priority", "Status", "Timeline", "Responsible"]],
          body: actionData,
          startY: yPos,
          theme: "grid",
          headStyles: { fillColor: [22, 163, 74] },
          styles: { fontSize: 8 },
        })
      }

      // Detailed SWOT Items
      doc.addPage()
      yPos = 30

      const categories = [
        { name: "Strengths", items: currentAnalysis.strengths, color: [34, 197, 94] },
        { name: "Weaknesses", items: currentAnalysis.weaknesses, color: [239, 68, 68] },
        { name: "Opportunities", items: currentAnalysis.opportunities, color: [59, 130, 246] },
        { name: "Threats", items: currentAnalysis.threats, color: [245, 158, 11] },
      ]

      categories.forEach((category) => {
        if (category.items.length > 0) {
          if (yPos > 250) {
            doc.addPage()
            yPos = 30
          }

          doc.setFontSize(14)
          doc.setTextColor(...category.color)
          doc.text(category.name, 20, yPos)
          yPos += 15

          category.items.forEach((item, index) => {
            if (yPos > 270) {
              doc.addPage()
              yPos = 30
            }

            doc.setFontSize(10)
            doc.setTextColor(0, 0, 0)
            doc.text(`${index + 1}. ${item.text}`, 25, yPos)
            yPos += 6
            doc.text(`Priority: ${item.priority}/5 | Impact: ${item.impact}/5`, 30, yPos)
            if (item.tags.length > 0) {
              yPos += 6
              doc.text(`Tags: ${item.tags.join(", ")}`, 30, yPos)
            }
            yPos += 10
          })
          yPos += 5
        }
      })

      // Footer
      const pageHeight = doc.internal.pageSize.height
      doc.setFontSize(10)
      doc.setTextColor(128, 128, 128)
      doc.text("Generated by Swot.works Tools", 20, pageHeight - 20)

      doc.save(
        `enhanced-swot-analysis-${currentAnalysis.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`,
      )
      setMessage("Enhanced PDF report downloaded successfully!")
    } catch (error) {
      console.error("Error generating PDF:", error)
      setMessage("Error generating PDF. Please try again.")
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "bg-red-100 text-red-800"
    if (priority >= 3) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getStatusColor = (status: ActionPlan["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showBackButton />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced SWOT Creator</h1>
          <p className="text-gray-600">
            Advanced strategic analysis with action planning, priority scoring, and recommendations
          </p>
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Analysis Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>SWOT Analysis Management</CardTitle>
            <CardDescription>Create and manage multiple SWOT analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create New Analysis */}
              <div className="space-y-4">
                <h3 className="font-semibold">Create New Analysis</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="analysis-name">Analysis Name</Label>
                    <Input
                      id="analysis-name"
                      placeholder="e.g., Q1 2025 Business Review"
                      value={newAnalysisForm.name}
                      onChange={(e) => setNewAnalysisForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="analysis-template">Template</Label>
                    <Select
                      value={newAnalysisForm.template}
                      onValueChange={(value) => setNewAnalysisForm((prev) => ({ ...prev, template: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SWOT_TEMPLATES.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} - {template.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="analysis-description">Description (Optional)</Label>
                    <Textarea
                      id="analysis-description"
                      placeholder="Brief description of this analysis..."
                      value={newAnalysisForm.description}
                      onChange={(e) => setNewAnalysisForm((prev) => ({ ...prev, description: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <Button onClick={createNewAnalysis} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Analysis
                  </Button>
                </div>
              </div>

              {/* Existing Analyses */}
              <div className="space-y-4">
                <h3 className="font-semibold">Existing Analyses ({analyses.length})</h3>
                {analyses.length === 0 ? (
                  <p className="text-gray-500 text-sm">No analyses created yet. Create your first one!</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {analyses.map((analysis) => (
                      <div
                        key={analysis.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          currentAnalysis?.id === analysis.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setCurrentAnalysis(analysis)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{analysis.name}</h4>
                            <p className="text-sm text-gray-600">
                              {SWOT_TEMPLATES.find((t) => t.id === analysis.template)?.name} •{" "}
                              {new Date(analysis.lastUpdated).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                duplicateAnalysis(analysis)
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteAnalysis(analysis.id)
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {currentAnalysis && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analysis">SWOT Analysis</TabsTrigger>
              <TabsTrigger value="actions">Action Plans</TabsTrigger>
              <TabsTrigger value="insights">Strategic Insights</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Add SWOT Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Add SWOT Items</CardTitle>
                    <CardDescription>Add detailed items with priority and impact scoring</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={newItemForm.category}
                        onValueChange={(value: any) => setNewItemForm((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strengths">Strengths</SelectItem>
                          <SelectItem value="weaknesses">Weaknesses</SelectItem>
                          <SelectItem value="opportunities">Opportunities</SelectItem>
                          <SelectItem value="threats">Threats</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Item Description</Label>
                      <Textarea
                        placeholder={
                          TEMPLATE_PROMPTS[currentAnalysis.template as keyof typeof TEMPLATE_PROMPTS]?.[
                            newItemForm.category
                          ] || "Enter your SWOT item..."
                        }
                        value={newItemForm.text}
                        onChange={(e) => setNewItemForm((prev) => ({ ...prev, text: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Priority (1-5)</Label>
                        <Select
                          value={newItemForm.priority.toString()}
                          onValueChange={(value) =>
                            setNewItemForm((prev) => ({ ...prev, priority: Number.parseInt(value) }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Low</SelectItem>
                            <SelectItem value="2">2 - Below Average</SelectItem>
                            <SelectItem value="3">3 - Average</SelectItem>
                            <SelectItem value="4">4 - High</SelectItem>
                            <SelectItem value="5">5 - Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Impact (1-5)</Label>
                        <Select
                          value={newItemForm.impact.toString()}
                          onValueChange={(value) =>
                            setNewItemForm((prev) => ({ ...prev, impact: Number.parseInt(value) }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Minimal</SelectItem>
                            <SelectItem value="2">2 - Low</SelectItem>
                            <SelectItem value="3">3 - Moderate</SelectItem>
                            <SelectItem value="4">4 - High</SelectItem>
                            <SelectItem value="5">5 - Significant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Tags (comma-separated)</Label>
                      <Input
                        placeholder="e.g., urgent, competitive-advantage, market-trend"
                        value={newItemForm.tags}
                        onChange={(e) => setNewItemForm((prev) => ({ ...prev, tags: e.target.value }))}
                      />
                    </div>

                    <Button onClick={addSWOTItem} className="w-full bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add SWOT Item
                    </Button>
                  </CardContent>
                </Card>

                {/* Enhanced SWOT Grid */}
                <Card>
                  <CardHeader>
                    <CardTitle>SWOT Analysis Grid</CardTitle>
                    <CardDescription>Visual representation with priority indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div ref={gridRef} className="grid grid-cols-2 gap-4 h-[600px]">
                      {/* Strengths */}
                      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex flex-col">
                        <h3 className="text-green-700 font-bold text-lg mb-3 text-center flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 mr-2" />
                          STRENGTHS ({currentAnalysis.strengths.length})
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-2">
                          {currentAnalysis.strengths.length === 0 ? (
                            <span className="text-gray-400 italic text-sm">No strengths added yet</span>
                          ) : (
                            currentAnalysis.strengths.map((item) => (
                              <div key={item.id} className="bg-white p-2 rounded border">
                                <p className="text-sm text-gray-700">{item.text}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getPriorityColor(item.priority)}>P{item.priority}</Badge>
                                  <Badge variant="outline">I{item.impact}</Badge>
                                  {item.actionable && <Badge className="bg-blue-100 text-blue-800">Actionable</Badge>}
                                </div>
                                {item.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.tags.map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Weaknesses */}
                      <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex flex-col">
                        <h3 className="text-red-700 font-bold text-lg mb-3 text-center flex items-center justify-center">
                          <TrendingDown className="w-5 h-5 mr-2" />
                          WEAKNESSES ({currentAnalysis.weaknesses.length})
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-2">
                          {currentAnalysis.weaknesses.length === 0 ? (
                            <span className="text-gray-400 italic text-sm">No weaknesses added yet</span>
                          ) : (
                            currentAnalysis.weaknesses.map((item) => (
                              <div key={item.id} className="bg-white p-2 rounded border">
                                <p className="text-sm text-gray-700">{item.text}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getPriorityColor(item.priority)}>P{item.priority}</Badge>
                                  <Badge variant="outline">I{item.impact}</Badge>
                                  {item.actionable && <Badge className="bg-blue-100 text-blue-800">Actionable</Badge>}
                                </div>
                                {item.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.tags.map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Opportunities */}
                      <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 flex flex-col">
                        <h3 className="text-blue-700 font-bold text-lg mb-3 text-center flex items-center justify-center">
                          <Lightbulb className="w-5 h-5 mr-2" />
                          OPPORTUNITIES ({currentAnalysis.opportunities.length})
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-2">
                          {currentAnalysis.opportunities.length === 0 ? (
                            <span className="text-gray-400 italic text-sm">No opportunities added yet</span>
                          ) : (
                            currentAnalysis.opportunities.map((item) => (
                              <div key={item.id} className="bg-white p-2 rounded border">
                                <p className="text-sm text-gray-700">{item.text}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getPriorityColor(item.priority)}>P{item.priority}</Badge>
                                  <Badge variant="outline">I{item.impact}</Badge>
                                  {item.actionable && <Badge className="bg-blue-100 text-blue-800">Actionable</Badge>}
                                </div>
                                {item.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.tags.map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Threats */}
                      <div className="bg-amber-50 border-2 border-amber-500 rounded-lg p-4 flex flex-col">
                        <h3 className="text-amber-700 font-bold text-lg mb-3 text-center flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 mr-2" />
                          THREATS ({currentAnalysis.threats.length})
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-2">
                          {currentAnalysis.threats.length === 0 ? (
                            <span className="text-gray-400 italic text-sm">No threats added yet</span>
                          ) : (
                            currentAnalysis.threats.map((item) => (
                              <div key={item.id} className="bg-white p-2 rounded border">
                                <p className="text-sm text-gray-700">{item.text}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getPriorityColor(item.priority)}>P{item.priority}</Badge>
                                  <Badge variant="outline">I{item.impact}</Badge>
                                  {item.actionable && <Badge className="bg-blue-100 text-blue-800">Actionable</Badge>}
                                </div>
                                {item.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.tags.map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Add Action Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle>Create Action Plan</CardTitle>
                    <CardDescription>Turn SWOT insights into actionable strategies</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Strategy Type</Label>
                      <Select
                        value={newActionForm.category}
                        onValueChange={(value: any) => setNewActionForm((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SO">SO - Strengths + Opportunities</SelectItem>
                          <SelectItem value="WO">WO - Weaknesses + Opportunities</SelectItem>
                          <SelectItem value="ST">ST - Strengths + Threats</SelectItem>
                          <SelectItem value="WT">WT - Weaknesses + Threats</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Action Title</Label>
                      <Input
                        placeholder="e.g., Launch new product line"
                        value={newActionForm.title}
                        onChange={(e) => setNewActionForm((prev) => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Detailed description of the action plan..."
                        value={newActionForm.description}
                        onChange={(e) => setNewActionForm((prev) => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Priority</Label>
                        <Select
                          value={newActionForm.priority.toString()}
                          onValueChange={(value) =>
                            setNewActionForm((prev) => ({ ...prev, priority: Number.parseInt(value) }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Low</SelectItem>
                            <SelectItem value="2">2 - Medium</SelectItem>
                            <SelectItem value="3">3 - High</SelectItem>
                            <SelectItem value="4">4 - Urgent</SelectItem>
                            <SelectItem value="5">5 - Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Timeline</Label>
                        <Input
                          placeholder="e.g., Q1 2025, 3 months"
                          value={newActionForm.timeline}
                          onChange={(e) => setNewActionForm((prev) => ({ ...prev, timeline: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Responsible Person/Team</Label>
                      <Input
                        placeholder="e.g., Marketing Team, John Doe"
                        value={newActionForm.responsible}
                        onChange={(e) => setNewActionForm((prev) => ({ ...prev, responsible: e.target.value }))}
                      />
                    </div>

                    <Button onClick={addActionPlan} className="w-full bg-green-600 hover:bg-green-700">
                      <Target className="w-4 h-4 mr-2" />
                      Create Action Plan
                    </Button>
                  </CardContent>
                </Card>

                {/* Action Plans List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Action Plans ({currentAnalysis.actionPlans.length})</CardTitle>
                    <CardDescription>Track and manage your strategic actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentAnalysis.actionPlans.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p>No action plans created yet</p>
                        <p className="text-sm">Create your first action plan to turn insights into action</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {currentAnalysis.actionPlans
                          .sort((a, b) => b.priority - a.priority)
                          .map((action) => (
                            <div key={action.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium">{action.title}</h4>
                                <div className="flex gap-2">
                                  <Badge className={getPriorityColor(action.priority)}>P{action.priority}</Badge>
                                  <Badge variant="outline">{action.category}</Badge>
                                </div>
                              </div>
                              {action.description && <p className="text-sm text-gray-600 mb-2">{action.description}</p>}
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <div>
                                  {action.timeline && <span>Timeline: {action.timeline}</span>}
                                  {action.responsible && <span> • Responsible: {action.responsible}</span>}
                                </div>
                                <Select
                                  value={action.status}
                                  onValueChange={(value: ActionPlan["status"]) => updateActionStatus(action.id, value)}
                                >
                                  <SelectTrigger className="w-32 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="planned">Planned</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="mt-2">
                                <Badge className={getStatusColor(action.status)}>{action.status}</Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Strategic Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      Strategic Recommendations
                    </CardTitle>
                    <CardDescription>AI-generated strategic insights based on your SWOT</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {generateStrategicRecommendations().map((rec, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{rec.title}</h4>
                            <Badge
                              className={
                                rec.priority === "Critical"
                                  ? "bg-red-100 text-red-800"
                                  : rec.priority === "High"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-blue-100 text-blue-800"
                              }
                            >
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                          <Badge variant="outline">{rec.type} Strategy</Badge>
                        </div>
                      ))}
                      {generateStrategicRecommendations().length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          Add SWOT items to generate strategic recommendations
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Analytics Dashboard */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Analysis Overview
                    </CardTitle>
                    <CardDescription>Key metrics and insights from your SWOT</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{currentAnalysis.strengths.length}</div>
                          <div className="text-sm text-gray-600">Strengths</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{currentAnalysis.weaknesses.length}</div>
                          <div className="text-sm text-gray-600">Weaknesses</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{currentAnalysis.opportunities.length}</div>
                          <div className="text-sm text-gray-600">Opportunities</div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 rounded-lg">
                          <div className="text-2xl font-bold text-amber-600">{currentAnalysis.threats.length}</div>
                          <div className="text-sm text-gray-600">Threats</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>High Priority Items</span>
                            <span>
                              {
                                [
                                  ...currentAnalysis.strengths,
                                  ...currentAnalysis.weaknesses,
                                  ...currentAnalysis.opportunities,
                                  ...currentAnalysis.threats,
                                ].filter((item) => item.priority >= 4).length
                              }
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  ([
                                    ...currentAnalysis.strengths,
                                    ...currentAnalysis.weaknesses,
                                    ...currentAnalysis.opportunities,
                                    ...currentAnalysis.threats,
                                  ].filter((item) => item.priority >= 4).length /
                                    Math.max(
                                      [
                                        ...currentAnalysis.strengths,
                                        ...currentAnalysis.weaknesses,
                                        ...currentAnalysis.opportunities,
                                        ...currentAnalysis.threats,
                                      ].length,
                                      1,
                                    )) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Actionable Items</span>
                            <span>
                              {
                                [
                                  ...currentAnalysis.strengths,
                                  ...currentAnalysis.weaknesses,
                                  ...currentAnalysis.opportunities,
                                  ...currentAnalysis.threats,
                                ].filter((item) => item.actionable).length
                              }
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  ([
                                    ...currentAnalysis.strengths,
                                    ...currentAnalysis.weaknesses,
                                    ...currentAnalysis.opportunities,
                                    ...currentAnalysis.threats,
                                  ].filter((item) => item.actionable).length /
                                    Math.max(
                                      [
                                        ...currentAnalysis.strengths,
                                        ...currentAnalysis.weaknesses,
                                        ...currentAnalysis.opportunities,
                                        ...currentAnalysis.threats,
                                      ].length,
                                      1,
                                    )) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Completed Actions</span>
                            <span>
                              {currentAnalysis.actionPlans.filter((action) => action.status === "completed").length}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  (currentAnalysis.actionPlans.filter((action) => action.status === "completed")
                                    .length /
                                    Math.max(currentAnalysis.actionPlans.length, 1)) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Export & Reports
                  </CardTitle>
                  <CardDescription>Generate comprehensive reports and export your analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Available Reports</h3>
                      <div className="space-y-3">
                        <Button
                          onClick={downloadEnhancedPDF}
                          disabled={isLoading}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {isLoading ? "Generating..." : "Enhanced PDF Report"}
                        </Button>
                        <p className="text-sm text-gray-600">
                          Comprehensive report with SWOT analysis, strategic recommendations, action plans, and
                          analytics
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Report Contents</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Executive summary with key metrics</li>
                        <li>• Detailed SWOT analysis with priority scoring</li>
                        <li>• Strategic recommendations by category</li>
                        <li>• Action plans with timelines and responsibilities</li>
                        <li>• Visual analytics and progress tracking</li>
                        <li>• Professional formatting for presentations</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {!currentAnalysis && (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No SWOT Analysis Selected</h3>
              <p className="text-gray-500 mb-6">
                Create your first SWOT analysis to get started with strategic planning
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

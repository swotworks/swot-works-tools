"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PageWrapper } from "@/components/page-wrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Download, FileImage, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface BusinessCard {
  id: string
  name: string
  title: string
  company: string
  phone: string
  email: string
  website: string
  address: string
  template: string
  createdAt: string
}

const templates = {
  modern: {
    name: "Modern",
    bgColor: "bg-white",
    textColor: "text-gray-900",
    accentColor: "text-green-600",
    borderColor: "border-gray-200",
  },
  professional: {
    name: "Professional",
    bgColor: "bg-gray-900",
    textColor: "text-white",
    accentColor: "text-green-400",
    borderColor: "border-gray-700",
  },
  elegant: {
    name: "Elegant",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100",
    textColor: "text-gray-900",
    accentColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  creative: {
    name: "Creative",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-100",
    textColor: "text-gray-900",
    accentColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
}

export default function BusinessCardMakerPage() {
  const { toast } = useToast()
  const [cards, setCards] = useState<BusinessCard[]>([])
  const [currentCard, setCurrentCard] = useState<Partial<BusinessCard>>({
    name: "",
    title: "",
    company: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    template: "modern",
  })
  const [previewCard, setPreviewCard] = useState<BusinessCard | null>(null)

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("businessCards")
    if (saved) {
      setCards(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("businessCards", JSON.stringify(cards))
  }, [cards])

  const saveCard = () => {
    if (!currentCard.name?.trim() || !currentCard.company?.trim()) {
      toast({
        title: "Invalid Card",
        description: "Please enter at least name and company information.",
        variant: "destructive",
      })
      return
    }

    const newCard: BusinessCard = {
      id: Date.now().toString(),
      name: currentCard.name || "",
      title: currentCard.title || "",
      company: currentCard.company || "",
      phone: currentCard.phone || "",
      email: currentCard.email || "",
      website: currentCard.website || "",
      address: currentCard.address || "",
      template: currentCard.template || "modern",
      createdAt: new Date().toISOString(),
    }

    setCards([newCard, ...cards])
    setCurrentCard({
      name: "",
      title: "",
      company: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      template: "modern",
    })

    toast({
      title: "Business Card Saved",
      description: "Your business card has been saved successfully.",
    })
  }

  const deleteCard = (id: string) => {
    setCards(cards.filter((card) => card.id !== id))
    toast({
      title: "Card Deleted",
      description: "Business card has been removed.",
    })
  }

  const clearAllCards = () => {
    setCards([])
    setCurrentCard({
      name: "",
      title: "",
      company: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      template: "modern",
    })
    toast({
      title: "All Cards Cleared",
      description: "All business cards have been removed.",
    })
  }

  const exportToPDF = async (card: BusinessCard) => {
    const pdf = new jsPDF("landscape", "mm", [85.6, 53.98]) // Standard business card size

    // Set background
    const template = templates[card.template as keyof typeof templates]
    if (card.template === "professional") {
      pdf.setFillColor(17, 24, 39) // gray-900
      pdf.rect(0, 0, 85.6, 53.98, "F")
    } else {
      pdf.setFillColor(255, 255, 255) // white
      pdf.rect(0, 0, 85.6, 53.98, "F")
    }

    // Add border
    pdf.setDrawColor(229, 231, 235) // gray-200
    pdf.setLineWidth(0.5)
    pdf.rect(2, 2, 81.6, 49.98)

    // Company name (top)
    pdf.setFontSize(16)
    pdf.setTextColor(card.template === "professional" ? 255 : 0, card.template === "professional" ? 255 : 0, 0)
    pdf.text(card.company, 5, 10)

    // Name
    pdf.setFontSize(14)
    pdf.setTextColor(22, 163, 74) // green-600
    pdf.text(card.name, 5, 18)

    // Title
    if (card.title) {
      pdf.setFontSize(10)
      pdf.setTextColor(
        card.template === "professional" ? 255 : 107,
        card.template === "professional" ? 255 : 114,
        card.template === "professional" ? 255 : 128,
      )
      pdf.text(card.title, 5, 25)
    }

    // Contact info
    pdf.setFontSize(8)
    pdf.setTextColor(card.template === "professional" ? 255 : 0, card.template === "professional" ? 255 : 0, 0)
    let yPos = 35

    if (card.phone) {
      pdf.text(`Phone: ${card.phone}`, 5, yPos)
      yPos += 4
    }
    if (card.email) {
      pdf.text(`Email: ${card.email}`, 5, yPos)
      yPos += 4
    }
    if (card.website) {
      pdf.text(`Web: ${card.website}`, 5, yPos)
      yPos += 4
    }
    if (card.address) {
      const addressLines = pdf.splitTextToSize(card.address, 40)
      pdf.text(addressLines, 5, yPos)
    }

    // Footer
    pdf.setFontSize(6)
    pdf.setTextColor(156, 163, 175) // gray-400
    pdf.text("Generated by Swot.works Tools", 5, 50)

    pdf.save(`business-card-${card.name.replace(/\s+/g, "-")}.pdf`)
    toast({
      title: "PDF Exported",
      description: "Business card has been exported for printing.",
    })
  }

  const exportToJPEG = async (card: BusinessCard) => {
    setPreviewCard(card)
    setTimeout(async () => {
      const element = document.getElementById("card-preview")
      if (element) {
        const canvas = await html2canvas(element, { scale: 3, backgroundColor: null })
        const link = document.createElement("a")
        link.download = `business-card-${card.name.replace(/\s+/g, "-")}.jpg`
        link.href = canvas.toDataURL("image/jpeg", 0.95)
        link.click()
        setPreviewCard(null)

        toast({
          title: "JPEG Exported",
          description: "Business card has been exported for digital sharing.",
        })
      }
    }, 100)
  }

  const BusinessCardPreview = ({
    card,
    isPreview = false,
  }: { card: BusinessCard | Partial<BusinessCard>; isPreview?: boolean }) => {
    const template = templates[(card.template as keyof typeof templates) || "modern"]

    return (
      <div
        className={`w-full aspect-[1.75/1] ${template.bgColor} ${template.textColor} ${template.borderColor} border-2 rounded-lg p-4 shadow-lg ${
          isPreview ? "max-w-[350px]" : ""
        }`}
        style={{ minHeight: "200px" }}
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            <h2 className={`text-lg font-bold ${template.accentColor} mb-1`}>{card.company || "Company Name"}</h2>
            <h3 className="text-base font-semibold mb-1">{card.name || "Your Name"}</h3>
            {card.title && <p className="text-sm opacity-75 mb-2">{card.title}</p>}
          </div>

          <div className="text-xs space-y-1">
            {card.phone && <p>📞 {card.phone}</p>}
            {card.email && <p>✉️ {card.email}</p>}
            {card.website && <p>🌐 {card.website}</p>}
            {card.address && <p className="opacity-75">📍 {card.address}</p>}
          </div>

          <div className="text-xs opacity-50 text-right">Swot.works Tools</div>
        </div>
      </div>
    )
  }

  return (
    <PageWrapper
      title="Business Card Maker"
      description="Create professional business cards for print and digital sharing"
    >
      <div className="space-y-8">
        {/* Business Card Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Create Business Card
                </CardTitle>
                <CardDescription>Fill in your information to generate a professional business card</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={currentCard.name}
                      onChange={(e) => setCurrentCard({ ...currentCard, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      placeholder="CEO, Manager, etc."
                      value={currentCard.title}
                      onChange={(e) => setCurrentCard({ ...currentCard, title: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      placeholder="Your Company"
                      value={currentCard.company}
                      onChange={(e) => setCurrentCard({ ...currentCard, company: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+92 300 1234567"
                      value={currentCard.phone}
                      onChange={(e) => setCurrentCard({ ...currentCard, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={currentCard.email}
                      onChange={(e) => setCurrentCard({ ...currentCard, email: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="www.company.com"
                      value={currentCard.website}
                      onChange={(e) => setCurrentCard({ ...currentCard, website: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="123 Business St, City, Country"
                      value={currentCard.address}
                      onChange={(e) => setCurrentCard({ ...currentCard, address: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="template">Template</Label>
                    <Select
                      value={currentCard.template}
                      onValueChange={(value) => setCurrentCard({ ...currentCard, template: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(templates).map(([key, template]) => (
                          <SelectItem key={key} value={key}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveCard} className="bg-green-600 hover:bg-green-700">
                    <User className="w-4 h-4 mr-2" />
                    Save Card
                  </Button>
                  <Button variant="outline" onClick={clearAllCards}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
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
                <CardDescription>See how your business card will look</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-8">
                <BusinessCardPreview card={currentCard} isPreview />
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Saved Cards */}
        {cards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">Saved Business Cards</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{card.name}</CardTitle>
                          <CardDescription>
                            {card.company} • Created {new Date(card.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => exportToPDF(card)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => exportToJPEG(card)}>
                            <FileImage className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteCard(card.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <BusinessCardPreview card={card} />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Hidden Preview for Export */}
        {previewCard && (
          <div id="card-preview" className="fixed -top-[9999px] left-0 bg-white">
            <div className="w-[1050px] h-[600px] p-12">
              <BusinessCardPreview card={previewCard} />
            </div>
          </div>
        )}

        {cards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center py-12"
          >
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Business Cards Yet</h3>
            <p className="text-muted-foreground">
              Create your first professional business card for networking and brand building.
            </p>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  )
}

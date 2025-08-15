"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PageWrapper } from "@/components/page-wrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Receipt, Download, FileImage, Trash2, Plus, Minus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

interface ClientInfo {
  name: string
  email: string
  phone: string
  address: string
}

interface InvoiceData {
  id: string
  invoiceNumber: string
  date: string
  dueDate: string
  client: ClientInfo
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes: string
  createdAt: string
}

export default function InvoiceGeneratorPage() {
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<InvoiceData[]>([])
  const [currentInvoice, setCurrentInvoice] = useState<Partial<InvoiceData>>({
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    client: { name: "", email: "", phone: "", address: "" },
    items: [],
    taxRate: 0,
    notes: "",
  })
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceData | null>(null)

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("invoiceData")
    if (saved) {
      setInvoices(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("invoiceData", JSON.stringify(invoices))
  }, [invoices])

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    }
    setCurrentInvoice({
      ...currentInvoice,
      items: [...(currentInvoice.items || []), newItem],
    })
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = (currentInvoice.items || []).map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === "quantity" || field === "rate") {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate
        }
        return updatedItem
      }
      return item
    })
    setCurrentInvoice({ ...currentInvoice, items: updatedItems })
  }

  const removeItem = (id: string) => {
    setCurrentInvoice({
      ...currentInvoice,
      items: (currentInvoice.items || []).filter((item) => item.id !== id),
    })
  }

  const calculateTotals = () => {
    const items = currentInvoice.items || []
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = subtotal * ((currentInvoice.taxRate || 0) / 100)
    const total = subtotal + taxAmount

    return { subtotal, taxAmount, total }
  }

  const saveInvoice = () => {
    const { client, items } = currentInvoice

    if (!client?.name || !items?.length) {
      toast({
        title: "Invalid Invoice",
        description: "Please add client information and at least one item.",
        variant: "destructive",
      })
      return
    }

    const { subtotal, taxAmount, total } = calculateTotals()

    const newInvoice: InvoiceData = {
      id: Date.now().toString(),
      invoiceNumber: currentInvoice.invoiceNumber || `INV-${Date.now()}`,
      date: currentInvoice.date || new Date().toISOString().split("T")[0],
      dueDate: currentInvoice.dueDate || new Date().toISOString().split("T")[0],
      client: client as ClientInfo,
      items: items as InvoiceItem[],
      subtotal,
      taxRate: currentInvoice.taxRate || 0,
      taxAmount,
      total,
      notes: currentInvoice.notes || "",
      createdAt: new Date().toISOString(),
    }

    setInvoices([newInvoice, ...invoices])
    setCurrentInvoice({
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      client: { name: "", email: "", phone: "", address: "" },
      items: [],
      taxRate: 0,
      notes: "",
    })

    toast({
      title: "Invoice Saved",
      description: `Invoice ${newInvoice.invoiceNumber} has been saved successfully.`,
    })
  }

  const deleteInvoice = (id: string) => {
    setInvoices(invoices.filter((invoice) => invoice.id !== id))
    toast({
      title: "Invoice Deleted",
      description: "Invoice has been removed.",
    })
  }

  const exportToPDF = async (invoice: InvoiceData) => {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()

    // Header with logo placeholder
    pdf.setFontSize(24)
    pdf.text("INVOICE", pageWidth - 20, 30, { align: "right" })
    pdf.setFontSize(16)
    pdf.text("Swot.works Tools", 20, 30)

    // Invoice details
    pdf.setFontSize(12)
    pdf.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - 20, 50, { align: "right" })
    pdf.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, pageWidth - 20, 60, { align: "right" })
    pdf.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, pageWidth - 20, 70, { align: "right" })

    // Client information
    pdf.setFontSize(14)
    pdf.text("Bill To:", 20, 60)
    pdf.setFontSize(12)
    let yPos = 70
    pdf.text(invoice.client.name, 20, yPos)
    if (invoice.client.email) {
      yPos += 10
      pdf.text(invoice.client.email, 20, yPos)
    }
    if (invoice.client.phone) {
      yPos += 10
      pdf.text(invoice.client.phone, 20, yPos)
    }
    if (invoice.client.address) {
      yPos += 10
      const addressLines = pdf.splitTextToSize(invoice.client.address, 80)
      pdf.text(addressLines, 20, yPos)
      yPos += addressLines.length * 5
    }

    // Items table
    yPos = Math.max(yPos + 20, 120)
    pdf.setFontSize(12)
    pdf.text("Description", 20, yPos)
    pdf.text("Qty", 120, yPos, { align: "center" })
    pdf.text("Rate", 140, yPos, { align: "center" })
    pdf.text("Amount", pageWidth - 20, yPos, { align: "right" })

    pdf.line(20, yPos + 2, pageWidth - 20, yPos + 2)
    yPos += 15

    invoice.items.forEach((item) => {
      if (yPos > 250) {
        pdf.addPage()
        yPos = 30
      }

      const descLines = pdf.splitTextToSize(item.description, 90)
      pdf.text(descLines, 20, yPos)
      pdf.text(item.quantity.toString(), 120, yPos, { align: "center" })
      pdf.text(`PKR ${item.rate.toLocaleString()}`, 140, yPos, { align: "center" })
      pdf.text(`PKR ${item.amount.toLocaleString()}`, pageWidth - 20, yPos, { align: "right" })
      yPos += Math.max(descLines.length * 5, 10) + 5
    })

    // Totals
    yPos += 10
    pdf.line(120, yPos, pageWidth - 20, yPos)
    yPos += 10

    pdf.text("Subtotal:", 140, yPos)
    pdf.text(`PKR ${invoice.subtotal.toLocaleString()}`, pageWidth - 20, yPos, { align: "right" })
    yPos += 10

    if (invoice.taxRate > 0) {
      pdf.text(`Tax (${invoice.taxRate}%):`, 140, yPos)
      pdf.text(`PKR ${invoice.taxAmount.toLocaleString()}`, pageWidth - 20, yPos, { align: "right" })
      yPos += 10
    }

    pdf.setFontSize(14)
    pdf.text("Total:", 140, yPos)
    pdf.text(`PKR ${invoice.total.toLocaleString()}`, pageWidth - 20, yPos, { align: "right" })

    // Notes
    if (invoice.notes) {
      yPos += 20
      pdf.setFontSize(12)
      pdf.text("Notes:", 20, yPos)
      yPos += 10
      const notesLines = pdf.splitTextToSize(invoice.notes, pageWidth - 40)
      pdf.text(notesLines, 20, yPos)
    }

    // Footer
    pdf.setFontSize(8)
    pdf.text("Generated by Swot.works Tools — 2025", pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, {
      align: "center",
    })

    pdf.save(`invoice-${invoice.invoiceNumber}.pdf`)
    toast({
      title: "PDF Exported",
      description: "Invoice has been exported successfully.",
    })
  }

  const exportToJPEG = async (invoice: InvoiceData) => {
    setPreviewInvoice(invoice)
    setTimeout(async () => {
      const element = document.getElementById("invoice-preview")
      if (element) {
        const canvas = await html2canvas(element, { scale: 2 })
        const link = document.createElement("a")
        link.download = `invoice-${invoice.invoiceNumber}.jpg`
        link.href = canvas.toDataURL("image/jpeg", 0.9)
        link.click()
        setPreviewInvoice(null)

        toast({
          title: "JPEG Exported",
          description: "Invoice has been exported as JPEG.",
        })
      }
    }, 100)
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  return (
    <PageWrapper
      title="Invoice Generator"
      description="Create professional invoices with client management and branded templates"
    >
      <div className="space-y-8">
        {/* Invoice Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Create New Invoice
              </CardTitle>
              <CardDescription>Fill in the details to generate a professional invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={currentInvoice.invoiceNumber}
                    onChange={(e) => setCurrentInvoice({ ...currentInvoice, invoiceNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Invoice Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={currentInvoice.date}
                    onChange={(e) => setCurrentInvoice({ ...currentInvoice, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={currentInvoice.dueDate}
                    onChange={(e) => setCurrentInvoice({ ...currentInvoice, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              {/* Client Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      placeholder="Enter client name"
                      value={currentInvoice.client?.name}
                      onChange={(e) =>
                        setCurrentInvoice({
                          ...currentInvoice,
                          client: { ...currentInvoice.client!, name: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder="client@example.com"
                      value={currentInvoice.client?.email}
                      onChange={(e) =>
                        setCurrentInvoice({
                          ...currentInvoice,
                          client: { ...currentInvoice.client!, email: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Phone</Label>
                    <Input
                      id="clientPhone"
                      placeholder="+92 300 1234567"
                      value={currentInvoice.client?.phone}
                      onChange={(e) =>
                        setCurrentInvoice({
                          ...currentInvoice,
                          client: { ...currentInvoice.client!, phone: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientAddress">Address</Label>
                    <Textarea
                      id="clientAddress"
                      placeholder="Enter client address"
                      value={currentInvoice.client?.address}
                      onChange={(e) =>
                        setCurrentInvoice({
                          ...currentInvoice,
                          client: { ...currentInvoice.client!, address: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Items</h3>
                  <Button onClick={addItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {(currentInvoice.items || []).map((item) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Input
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label>Rate (PKR)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, "rate", Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label>Amount</Label>
                          <Input value={`PKR ${item.amount.toLocaleString()}`} disabled />
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => removeItem(item.id)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Totals and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={currentInvoice.taxRate || ""}
                      onChange={(e) =>
                        setCurrentInvoice({ ...currentInvoice, taxRate: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes or terms"
                      value={currentInvoice.notes}
                      onChange={(e) => setCurrentInvoice({ ...currentInvoice, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>PKR {subtotal.toLocaleString()}</span>
                    </div>
                    {(currentInvoice.taxRate || 0) > 0 && (
                      <div className="flex justify-between">
                        <span>Tax ({currentInvoice.taxRate}%):</span>
                        <span>PKR {taxAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>PKR {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveInvoice} className="bg-green-600 hover:bg-green-700">
                  <Receipt className="w-4 h-4 mr-2" />
                  Save Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Saved Invoices */}
        {invoices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">Saved Invoices</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {invoices.map((invoice, index) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Receipt className="w-5 h-5" />
                          {invoice.invoiceNumber}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => exportToPDF(invoice)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => exportToJPEG(invoice)}>
                            <FileImage className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteInvoice(invoice.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        {invoice.client.name} • {new Date(invoice.date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Items:</span>
                          <span>{invoice.items.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Due Date:</span>
                          <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total:</span>
                          <span>PKR {invoice.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Hidden Invoice Preview for JPEG Export */}
        {previewInvoice && (
          <div id="invoice-preview" className="fixed -top-[9999px] left-0 bg-white p-8 w-[800px]">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">Swot.works Tools</h1>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold">INVOICE</h2>
                  <p>#{previewInvoice.invoiceNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold mb-2">Bill To:</h3>
                  <div>
                    <p className="font-semibold">{previewInvoice.client.name}</p>
                    {previewInvoice.client.email && <p>{previewInvoice.client.email}</p>}
                    {previewInvoice.client.phone && <p>{previewInvoice.client.phone}</p>}
                    {previewInvoice.client.address && <p>{previewInvoice.client.address}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p>Date: {new Date(previewInvoice.date).toLocaleDateString()}</p>
                  <p>Due: {new Date(previewInvoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-2">Description</th>
                    <th className="text-center p-2">Qty</th>
                    <th className="text-center p-2">Rate</th>
                    <th className="text-right p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {previewInvoice.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{item.description}</td>
                      <td className="text-center p-2">{item.quantity}</td>
                      <td className="text-center p-2">PKR {item.rate.toLocaleString()}</td>
                      <td className="text-right p-2">PKR {item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>PKR {previewInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  {previewInvoice.taxRate > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({previewInvoice.taxRate}%):</span>
                      <span>PKR {previewInvoice.taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>PKR {previewInvoice.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {previewInvoice.notes && (
                <div>
                  <h4 className="font-bold mb-2">Notes:</h4>
                  <p>{previewInvoice.notes}</p>
                </div>
              )}

              <div className="text-center text-sm text-gray-500 mt-8">Generated by Swot.works Tools — 2025</div>
            </div>
          </div>
        )}

        {invoices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center py-12"
          >
            <Receipt className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Invoices Created Yet</h3>
            <p className="text-muted-foreground">
              Create your first professional invoice to streamline your billing process.
            </p>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  )
}

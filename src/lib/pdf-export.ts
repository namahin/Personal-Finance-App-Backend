import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { Income, Expense, Lend, Borrow } from "@/types"
import { formatDate } from "@/lib/utils"

interface ReportData {
  title: string
  subtitle: string
  income: Income[]
  expense: Expense[]
  lend: Lend[]
  borrow: Borrow[]
}

export function generateFinancePDF(data: ReportData) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  doc.setFontSize(18)
  doc.setTextColor(16, 110, 86)
  doc.text("Hisabnikash — Personal Finance Report", pageWidth / 2, 18, { align: "center" })
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(data.subtitle, pageWidth / 2, 25, { align: "center" })

  let y = 35

  const totalIncome = data.income.reduce((s, i) => s + i.amount, 0)
  const totalExpense = data.expense.reduce((s, i) => s + i.amount, 0)
  const pendingLend = data.lend.filter(i => !i.paid).reduce((s, i) => s + i.amount, 0)
  const pendingBorrow = data.borrow.filter(i => !i.paid).reduce((s, i) => s + i.amount, 0)

  // Summary box
  doc.setFillColor(241, 250, 246)
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, "F")
  doc.setFontSize(9)
  doc.setTextColor(80)
  const colW = (pageWidth - 28) / 4
  const summaryItems = [
    ["Total Income", `Tk ${totalIncome.toLocaleString()}`],
    ["Total Expense", `Tk ${totalExpense.toLocaleString()}`],
    ["Net Balance", `Tk ${(totalIncome - totalExpense).toLocaleString()}`],
    ["Pending Lend/Borrow", `Tk ${pendingLend.toLocaleString()} / Tk ${pendingBorrow.toLocaleString()}`],
  ]
  summaryItems.forEach(([label, val], i) => {
    const x = 14 + i * colW + 4
    doc.setFontSize(8)
    doc.setTextColor(120)
    doc.text(label, x, y + 9)
    doc.setFontSize(11)
    doc.setTextColor(20)
    doc.text(val, x, y + 18)
  })

  y += 36

  // Income table
  if (data.income.length > 0) {
    doc.setFontSize(12)
    doc.setTextColor(16, 110, 86)
    doc.text("Income", 14, y)
    autoTable(doc, {
      startY: y + 3,
      head: [["Date", "From", "Medium", "Category", "Amount"]],
      body: data.income.map(i => [formatDate(i.date), i.from || "-", i.medium, i.category, `Tk ${i.amount.toLocaleString()}`]),
      theme: "striped",
      headStyles: { fillColor: [16, 110, 86] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })
    y = (doc as any).lastAutoTable.finalY + 10
  }

  // Expense table
  if (data.expense.length > 0) {
    if (y > 250) { doc.addPage(); y = 20 }
    doc.setFontSize(12)
    doc.setTextColor(190, 50, 50)
    doc.text("Expense", 14, y)
    autoTable(doc, {
      startY: y + 3,
      head: [["Date", "Pay To", "Medium", "Category", "Amount"]],
      body: data.expense.map(i => [formatDate(i.date), i.payTo || "-", i.medium, i.category, `Tk ${i.amount.toLocaleString()}`]),
      theme: "striped",
      headStyles: { fillColor: [190, 50, 50] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })
    y = (doc as any).lastAutoTable.finalY + 10
  }

  // Lend table
  if (data.lend.length > 0) {
    if (y > 250) { doc.addPage(); y = 20 }
    doc.setFontSize(12)
    doc.setTextColor(30, 90, 180)
    doc.text("Lent Money", 14, y)
    autoTable(doc, {
      startY: y + 3,
      head: [["Date", "To", "Amount", "Status"]],
      body: data.lend.map(i => [formatDate(i.date), i.to, `Tk ${i.amount.toLocaleString()}`, i.paid ? "Paid" : "Pending"]),
      theme: "striped",
      headStyles: { fillColor: [30, 90, 180] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })
    y = (doc as any).lastAutoTable.finalY + 10
  }

  // Borrow table
  if (data.borrow.length > 0) {
    if (y > 250) { doc.addPage(); y = 20 }
    doc.setFontSize(12)
    doc.setTextColor(180, 120, 20)
    doc.text("Borrowed Money", 14, y)
    autoTable(doc, {
      startY: y + 3,
      head: [["Date", "From", "Amount", "Status"]],
      body: data.borrow.map(i => [formatDate(i.date), i.from, `Tk ${i.amount.toLocaleString()}`, i.paid ? "Paid" : "Pending"]),
      theme: "striped",
      headStyles: { fillColor: [180, 120, 20] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })
  }

  // Footer on each page
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Generated on ${new Date().toLocaleDateString()} — Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" })
  }

  doc.save(`${data.title.replace(/\s+/g, "_")}.pdf`)
}

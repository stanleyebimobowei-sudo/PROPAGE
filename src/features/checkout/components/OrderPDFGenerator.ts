import { jsPDF } from 'jspdf'

import type { OrderConfirmation } from '@/features/checkout/hooks/CheckoutEngine'
import { SITE_CONFIG } from '@/constants/site'

function addLabelValue(pdf: jsPDF, label: string, value: string | undefined, x: number, y: number) {
  if (!value) {
    return y
  }

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.setTextColor(126, 118, 104)
  pdf.text(label.toUpperCase(), x, y)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)
  pdf.setTextColor(24, 21, 18)
  const lines = pdf.splitTextToSize(value, 160)
  pdf.text(lines, x, y + 6)

  return y + 12 + lines.length * 5
}

export function generateOrderConfirmationPdf(order: OrderConfirmation) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()

  pdf.setFillColor(10, 10, 10)
  pdf.rect(0, 0, pageWidth, 44, 'F')
  pdf.setFillColor(245, 158, 11)
  pdf.circle(22, 22, 9, 'F')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.setTextColor(255, 255, 255)
  pdf.text(SITE_CONFIG.name, 36, 20)
  pdf.setFontSize(8)
  pdf.setTextColor(245, 158, 11)
  pdf.text('ORDER CONFIRMATION', 36, 27)

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.setTextColor(20, 18, 16)
  pdf.text('Order Confirmation', 18, 62)
  pdf.setFontSize(10)
  pdf.setTextColor(98, 88, 76)
  pdf.text(`Order Number: ${order.id}`, 18, 70)
  pdf.text(`Order Date: ${order.orderDate}`, 18, 76)

  pdf.setDrawColor(232, 226, 216)
  pdf.roundedRect(18, 88, 174, 76, 5, 5)
  let leftY = addLabelValue(pdf, 'Customer Details', order.customer.fullName, 26, 102)
  leftY = addLabelValue(pdf, 'Phone Number', order.customer.phoneNumber, 26, leftY)
  leftY = addLabelValue(pdf, 'State', order.customer.state, 26, leftY)
  addLabelValue(pdf, 'Delivery Address', order.customer.address, 26, leftY)

  pdf.roundedRect(18, 174, 174, 58, 5, 5)
  let packageY = addLabelValue(pdf, 'Selected Package', order.package.title, 26, 188)
  packageY = addLabelValue(pdf, 'Promo Price', order.package.promoPrice, 26, packageY)
  packageY = addLabelValue(pdf, 'Original Price', order.package.oldPrice, 26, packageY)
  addLabelValue(pdf, 'Savings', order.package.savedAmount, 26, packageY)

  pdf.setFillColor(250, 247, 240)
  pdf.roundedRect(18, 244, 174, 28, 5, 5, 'F')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.setTextColor(126, 118, 104)
  pdf.text('DELIVERY & PAYMENT', 26, 256)
  pdf.setFontSize(11)
  pdf.setTextColor(20, 18, 16)
  pdf.text(`Estimated Delivery: ${order.estimatedDelivery}`, 26, 263)
  pdf.text('Payment Method: Payment on Delivery', 104, 263)

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.setTextColor(34, 139, 92)
  pdf.text(`Status: ${order.status}`, 18, 286)

  pdf.save(`${order.id}-order-confirmation.pdf`)
}

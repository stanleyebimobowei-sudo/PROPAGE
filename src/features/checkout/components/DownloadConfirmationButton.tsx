import { Download } from 'lucide-react'

import { generateOrderConfirmationPdf } from '@/features/checkout/components/OrderPDFGenerator'
import type { OrderConfirmation } from '@/features/checkout/hooks/CheckoutEngine'

type DownloadConfirmationButtonProps = {
  order: OrderConfirmation
}

export function DownloadConfirmationButton({ order }: DownloadConfirmationButtonProps) {
  return (
    <button
      type="button"
      onClick={() => generateOrderConfirmationPdf(order)}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.07] px-5 text-sm font-black uppercase tracking-[0.12em] text-white"
    >
      <Download className="size-4" aria-hidden="true" />
      Download Order Confirmation
    </button>
  )
}

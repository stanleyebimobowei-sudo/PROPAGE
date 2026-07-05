import type { OrderConfirmation } from '@/features/checkout/hooks/CheckoutEngine'

type OrderSummaryProps = {
  order: OrderConfirmation
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return null
  }

  return (
    <div className="grid gap-1 border-b border-white/8 py-3 last:border-b-0">
      <dt className="text-[0.68rem] font-black uppercase tracking-[0.15em] text-stone-500">{label}</dt>
      <dd className="text-sm font-bold leading-6 text-stone-100">{value}</dd>
    </div>
  )
}

export function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <dl className="rounded-[28px] border border-white/10 bg-white/[0.055] p-4">
      <SummaryRow label="Selected Package" value={order.package.title} />
      <SummaryRow label="Promo Price" value={order.package.promoPrice} />
      <SummaryRow label="Original Price" value={order.package.oldPrice} />
      <SummaryRow label="Savings" value={order.package.savedAmount} />
      <SummaryRow label="Customer Name" value={order.customer.fullName} />
      <SummaryRow label="Phone Number" value={order.customer.phoneNumber} />
      <SummaryRow label="State" value={order.customer.state} />
      <SummaryRow label="Address" value={order.customer.address} />
      <SummaryRow label="Delivery Note" value={order.customer.deliveryNote} />
      <SummaryRow label="Order Date" value={order.orderDate} />
      <SummaryRow label="Estimated Delivery" value={order.estimatedDelivery} />
      <SummaryRow label="Order Status" value={order.status} />
    </dl>
  )
}

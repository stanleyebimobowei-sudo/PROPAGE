import { getAdminSettings, parseMoney } from '@/features/admin/adminData'
import type { OrderConfirmation } from '@/features/checkout/hooks/CheckoutEngine'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown
  }
}

let initializedPixelId = ''

export function initializeFacebookPixel() {
  const pixelId = getAdminSettings().facebookPixelId.trim()
  if (!pixelId || initializedPixelId === pixelId) {
    return
  }

  initializedPixelId = pixelId

  if (!window.fbq) {
    const fbq = (...args: unknown[]) => {
      ;(fbq as unknown as { queue: unknown[] }).queue.push(args)
    }
    ;(fbq as unknown as { queue: unknown[] }).queue = []
    window.fbq = fbq
    window._fbq = fbq

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)
  }

  window.fbq('init', pixelId)
  window.fbq('track', 'PageView')
}

export function trackFacebookPurchase(order: OrderConfirmation) {
  initializeFacebookPixel()
  if (!window.fbq || !getAdminSettings().facebookPixelId.trim()) {
    return
  }

  window.fbq('track', 'Purchase', {
    value: parseMoney(order.package.promoPrice),
    currency: 'NGN',
    content_name: order.package.title,
    content_ids: [order.package.id],
    order_id: order.id,
  })
}

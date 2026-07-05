import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'

import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { AdminDashboard } from '@/features/admin/AdminDashboard'
import { PopupCheckout } from '@/features/checkout/components/PopupCheckout'
import { CheckoutEngineProvider } from '@/features/checkout/hooks/CheckoutEngine'

export function MarketingLayout() {
  const [adminOpen, setAdminOpen] = useState(false)

  useEffect(() => {
    const openAdmin = () => setAdminOpen(true)
    window.addEventListener('admin:request', openAdmin)

    return () => window.removeEventListener('admin:request', openAdmin)
  }, [])

  return (
    <CheckoutEngineProvider>
      <div className="min-h-screen bg-ink-950 text-stone-100">
        <Navbar />
        <main id="main-content">
          <Outlet />
        </main>
        <Footer />
        <PopupCheckout />
        {adminOpen ? <AdminDashboard onClose={() => setAdminOpen(false)} /> : null}
      </div>
    </CheckoutEngineProvider>
  )
}

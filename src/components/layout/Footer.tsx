import { Headphones, PackageCheck, ShieldCheck, Truck } from 'lucide-react'

import { SITE_CONFIG } from '@/constants/site'

const quickLinks = [
  ['Hero', '#hero'],
  ['Benefits', '#benefits'],
  ['Reviews', '#reviews'],
  ['Gallery', '#gallery'],
  ['About', '#about'],
  ['Order Form', '#order'],
  ['FAQ', '#faq'],
] as const

const trustBadges = [
  { label: 'Free Delivery', icon: Truck },
  { label: 'Payment on Delivery', icon: PackageCheck },
  { label: 'Money Back Guarantee', icon: ShieldCheck },
  { label: 'Customer Support', icon: Headphones },
] as const

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#050505] px-5 py-12 text-stone-300 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_1fr_1fr]">
          <div>
            <p className="font-serif text-3xl font-normal text-white">{SITE_CONFIG.name}</p>
            <p className="mt-4 max-w-sm text-sm font-medium leading-7 text-stone-400">
              Premium ginger-inspired hair and beard oil with free delivery, payment on delivery, and a customer-first
              confirmation process.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-gold-500">Quick Links</h3>
            <nav className="mt-4 grid gap-2" aria-label="Footer quick links">
              {quickLinks.map(([label, href]) => (
                <a className="text-sm font-bold text-stone-400 transition hover:text-mint-400" href={href} key={href}>
                  {label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-gold-500">Why Customers Trust Us</h3>
            <div className="mt-4 grid gap-3">
              {trustBadges.map(({ label, icon: Icon }) => (
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3" key={label}>
                  <span className="grid size-9 place-items-center rounded-xl border border-mint-400/20 bg-mint-400/10 text-mint-400">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-black text-stone-100">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-gold-500">Customer Support</h3>
            <p className="mt-4 text-sm font-medium leading-7 text-stone-400">
              Need help with delivery, order confirmation, or product instructions? Our support team is available to
              help you complete your order confidently.
            </p>
            <a
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] px-5 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:border-gold-500/40 hover:text-gold-500"
              href={SITE_CONFIG.contactHref}
            >
              Contact Support
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/8 pt-6 text-xs font-bold text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 {SITE_CONFIG.name}. All rights reserved.</p>
          <p>Secure Shopping • Free Delivery • Payment on Delivery</p>
        </div>
      </div>
    </footer>
  )
}

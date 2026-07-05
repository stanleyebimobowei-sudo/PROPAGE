import { motion } from 'framer-motion'
import { ShieldCheck, Truck } from 'lucide-react'

import brandSticker from '@/assets/brand-sticker-transparent.png'
import { CheckoutForm } from '@/features/checkout/components/CheckoutForm'
import { SuccessScreen } from '@/features/checkout/components/SuccessScreen'
import { useCheckoutEngine } from '@/features/checkout/hooks/CheckoutEngine'

export function InlineCheckout() {
  const { inlineView, requestInlineAvailability } = useCheckoutEngine()

  return (
    <section
      id="order"
      data-inline-checkout-section="true"
      className="relative isolate overflow-hidden bg-[#050505] px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8 lg:py-28"
      aria-labelledby="inline-checkout-heading"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,rgba(245,158,11,0.16),transparent_30%),radial-gradient(circle_at_84%_18%,rgba(52,211,153,0.12),transparent_26%),linear-gradient(180deg,#050505_0%,#0d0b09_52%,#050505_100%)]" />
      <motion.div
        className="relative mx-auto max-w-xl rounded-[36px] border border-white/12 bg-white/[0.055] p-4 shadow-[0_30px_110px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl sm:p-6 lg:max-w-7xl lg:rounded-[44px] lg:p-8 xl:p-10"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={brandSticker}
          alt="King of Ginger brand sticker"
          className="brand-sticker-shake pointer-events-none absolute right-3 top-3 z-10 w-20 drop-shadow-[0_16px_30px_rgba(0,0,0,0.48)] sm:right-5 sm:top-5 sm:w-24"
          loading="lazy"
        />
        <div className="mb-6 grid gap-4 pr-20 sm:pr-24 lg:mb-8 lg:max-w-3xl lg:pr-0">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl border border-gold-500/25 bg-gold-500/10 text-gold-500">
              <Truck className="size-5" aria-hidden="true" />
            </span>
            <span className="grid size-11 place-items-center rounded-2xl border border-mint-400/25 bg-mint-400/10 text-mint-400">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
          </div>
          <div>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-gold-500">Premium checkout</p>
            <h2
              id="inline-checkout-heading"
              className="mt-3 font-serif text-5xl font-normal leading-[0.92] tracking-normal text-white lg:text-7xl"
            >
              Secure Your Order
            </h2>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-stone-300 lg:text-lg lg:leading-8">
              Free delivery, payment on delivery, and quick confirmation from our team.
            </p>
          </div>
        </div>

        {inlineView === 'success' ? <SuccessScreen context="inline" /> : <CheckoutForm variant="inline" onSubmit={requestInlineAvailability} />}
      </motion.div>
    </section>
  )
}

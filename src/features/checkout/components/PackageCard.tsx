import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'

import brandSticker from '@/assets/brand-sticker-transparent.png'
import type { ProductPackage } from '@/features/landing/data/packages'

type PackageCardProps = {
  productPackage: ProductPackage
  selected: boolean
  onSelect: (packageId: string) => void
  compact?: boolean
}

export function PackageCard({ productPackage, selected, onSelect, compact = false }: PackageCardProps) {
  return (
    <motion.button
      type="button"
      layoutId={`checkout-package-${productPackage.id}`}
      onClick={() => onSelect(productPackage.id)}
      className={`group relative w-full overflow-hidden rounded-[28px] border text-left transition ${
        selected
          ? 'border-gold-500/70 bg-gold-500/[0.13] shadow-[0_0_0_1px_rgba(245,158,11,0.34),0_22px_70px_rgba(245,158,11,0.18)]'
          : 'border-white/10 bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
      }`}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      aria-pressed={selected}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(245,158,11,0.22),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent)] opacity-80" />
      <div className={`relative grid gap-4 ${compact ? 'p-4' : 'p-5'}`}>
        <div className="flex items-start gap-4">
          <img
            src={productPackage.image}
            alt={productPackage.imageAlt}
            className={`${compact ? 'size-20 lg:size-[4.75rem]' : 'size-24'} shrink-0 rounded-2xl object-cover shadow-[0_14px_34px_rgba(0,0,0,0.42)]`}
            loading="lazy"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-mint-400">{productPackage.discount}</p>
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full border ${
                  selected ? 'border-gold-500 bg-gold-500 text-ink-950' : 'border-white/15 bg-white/5 text-white/50'
                }`}
              >
                {selected ? <Check className="size-4" aria-hidden="true" /> : null}
              </span>
            </div>
            <h3 className={`${compact ? 'text-lg lg:text-xl' : 'text-xl'} mt-1 font-black tracking-normal text-white`}>
              {productPackage.title}
            </h3>
            <p className="mt-1 text-sm font-semibold leading-5 text-stone-300">
              {productPackage.offer.map((line) => (
                <span className="block" key={line}>
                  {line}
                </span>
              ))}
            </p>
          </div>
        </div>

        {productPackage.badge ? (
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold-500/25 bg-gold-500/10 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.13em] text-gold-500">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {productPackage.badge.label}
          </div>
        ) : null}

        <div className="relative grid gap-3 overflow-hidden rounded-2xl border border-white/10 bg-ink-950/58 p-4 pr-24 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:pr-4">
          <img
            src={brandSticker}
            alt=""
            className="brand-sticker-shake pointer-events-none absolute right-3 top-1/2 w-16 -translate-y-1/2 object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.44)] sm:hidden"
            aria-hidden="true"
            loading="lazy"
          />
          <div className="min-w-0">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-stone-500">Promo Price</p>
            <p className={`${compact ? 'text-2xl lg:text-[1.7rem]' : 'text-3xl'} mt-1 font-black tracking-normal text-white`}>
              {productPackage.promoPrice}
            </p>
            <p className="mt-1 text-sm font-bold text-stone-500 line-through">{productPackage.oldPrice}</p>
          </div>
          <div className="w-fit max-w-full rounded-2xl border border-mint-400/20 bg-mint-400/10 px-3 py-2 text-left text-[0.66rem] font-black uppercase leading-4 tracking-[0.08em] text-mint-400 sm:max-w-[118px] sm:text-right">
            {productPackage.savedAmount}
          </div>
        </div>
      </div>
    </motion.button>
  )
}

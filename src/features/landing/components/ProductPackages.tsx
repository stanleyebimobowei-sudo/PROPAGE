import { motion, type Variants } from 'framer-motion'
import { CheckCircle2, PackageCheck, ShieldCheck, ShoppingCart, Sparkles, Truck } from 'lucide-react'

import brandSticker from '@/assets/brand-sticker-transparent.png'
import { productPackages, type BenefitIcon, type PackageBenefit, type ProductPackage } from '@/features/landing/data/packages'

const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.1 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 38, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
}

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1], delay: 0.12 },
  },
}

const benefitIcons = {
  delivery: Truck,
  payment: PackageCheck,
  guarantee: ShieldCheck,
} satisfies Record<BenefitIcon, typeof Truck>

function openCheckout(packageId: string) {
  window.dispatchEvent(new CustomEvent('checkout:open', { detail: { packageId } }))
}

function PackageBadge({ badge }: { badge: ProductPackage['badge'] }) {
  if (!badge) {
    return null
  }

  const Icon = badge.tone === 'popular' ? Sparkles : CheckCircle2

  return (
    <div className="absolute left-5 top-5 z-20 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 bg-ink-950/55 px-4 text-[0.7rem] font-black uppercase tracking-[0.14em] text-white shadow-[0_14px_38px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl">
      <Icon className="size-4 text-gold-500" aria-hidden="true" />
      {badge.label}
    </div>
  )
}

function PriceCard({ productPackage }: { productPackage: ProductPackage }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-stone-400">Today only</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <strong className="text-3xl font-black tracking-normal text-white sm:text-[2.15rem]">
              {productPackage.promoPrice}
            </strong>
            <span className="text-sm font-bold text-stone-500 line-through">{productPackage.oldPrice}</span>
          </div>
        </div>
        <div className="max-w-full justify-self-start rounded-2xl border border-gold-500/30 bg-gold-500/12 px-3 py-2 text-left text-[0.66rem] font-black uppercase leading-4 tracking-[0.08em] text-gold-500 sm:max-w-[132px] sm:justify-self-end sm:text-right">
          <span className="block break-words">{productPackage.savedAmount}</span>
          {productPackage.discount ? <span className="block break-words text-white/72">{productPackage.discount}</span> : null}
        </div>
      </div>
    </div>
  )
}

function BenefitItem({ benefit }: { benefit: PackageBenefit }) {
  const Icon = benefitIcons[benefit.icon]

  return (
    <li className="flex min-h-9 items-center gap-3 text-sm font-semibold text-stone-200">
      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-mint-400/20 bg-mint-400/10 text-mint-400">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span>{benefit.label}</span>
    </li>
  )
}

function BuyButton({ productPackage }: { productPackage: ProductPackage }) {
  return (
    <motion.button
      aria-label={`${productPackage.buttonText} - ${productPackage.title}`}
      className="group relative inline-flex min-h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-full border border-ink-950/30 bg-linear-to-br from-[#facc15] via-gold-500 to-gold-600 px-8 text-sm font-black uppercase tracking-[0.16em] text-ink-950 shadow-[0_16px_44px_rgba(245,158,11,0.34),inset_0_2px_0_rgba(255,255,255,0.48),inset_0_-4px_0_rgba(0,0,0,0.18)] transition focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-4 focus:ring-offset-ink-950"
      onClick={() => openCheckout(productPackage.id)}
      type="button"
      whileHover={{ y: -3, scale: 1.025 }}
      whileTap={{ scale: 0.97 }}
    >
      <span className="absolute inset-0 bg-white/20 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
      <ShoppingCart className="relative size-5" aria-hidden="true" />
      <span className="relative">{productPackage.buttonText}</span>
    </motion.button>
  )
}

function PackageCard({ productPackage }: { productPackage: ProductPackage }) {
  return (
    <motion.article
      className="group relative min-h-[680px] overflow-hidden rounded-[32px] border border-white/12 bg-white/[0.055] shadow-[0_28px_90px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl"
      variants={cardVariants}
      whileHover={{ y: -8, scale: 1.012 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.18),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0))]" aria-hidden="true" />
      <div className="absolute -inset-px rounded-[32px] opacity-0 shadow-[0_0_70px_rgba(245,158,11,0.2)] transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />

      <PackageBadge badge={productPackage.badge} />

      <div className="relative h-[390px] overflow-hidden rounded-t-[32px] bg-linear-to-b from-white/10 to-ink-950">
        <img
          alt={productPackage.imageAlt}
          className="size-full object-cover object-center transition duration-700 group-hover:scale-105"
          loading="lazy"
          src={productPackage.image}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-ink-950/4 to-ink-950/72" aria-hidden="true" />
      </div>

      <motion.div
        className="absolute inset-x-4 bottom-4 rounded-[28px] border border-white/14 bg-ink-950/72 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-2xl sm:inset-x-5 sm:bottom-5 sm:p-6"
        variants={panelVariants}
      >
        <img
          alt="King of Ginger brand sticker"
          className="brand-sticker-shake pointer-events-none absolute right-4 top-4 w-16 drop-shadow-[0_14px_24px_rgba(0,0,0,0.42)] sm:right-5 sm:top-5 sm:w-20"
          loading="lazy"
          src={brandSticker}
        />

        <div className="mb-5 pr-20 sm:pr-24">
          <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-mint-400">{productPackage.product}</p>
          <h3 className="mt-2 font-serif text-[2.35rem] font-normal leading-none tracking-normal text-white">{productPackage.title}</h3>
          <p className="mt-3 text-base font-semibold leading-6 text-stone-300">
            {productPackage.offer.map((line) => (
              <span className="block" key={line}>
                {line}
              </span>
            ))}
            {productPackage.totalBottles ? <span className="mt-1 block text-gold-500">{productPackage.totalBottles}</span> : null}
          </p>
        </div>

        <div className="grid gap-4">
          <PriceCard productPackage={productPackage} />
          <ul className="grid gap-2" aria-label="Package benefits">
            {productPackage.benefits.map((benefit) => (
              <BenefitItem benefit={benefit} key={benefit.label} />
            ))}
          </ul>
          <BuyButton productPackage={productPackage} />
        </div>
      </motion.div>
    </motion.article>
  )
}

export function ProductPackages() {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#050505] px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8 lg:py-28"
      aria-labelledby="product-packages-heading"
      id="packages"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_12%,rgba(245,158,11,0.18),transparent_30%),radial-gradient(circle_at_78%_8%,rgba(52,211,153,0.12),transparent_28%),linear-gradient(180deg,#050505_0%,#0f0d0b_46%,#050505_100%)]" aria-hidden="true" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-gold-500">Premium bundles</p>
          <h2
            className="mt-4 font-serif text-5xl font-normal leading-[0.95] tracking-normal text-white sm:text-6xl lg:text-7xl"
            id="product-packages-heading"
          >
            Choose Your Growth Package
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
            Get Ginger Hair Growth Oil in value-packed bundles with fast delivery, payment on delivery, and a clear guarantee.
          </p>
        </div>

        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
          initial="hidden"
          variants={sectionVariants}
          viewport={{ once: true, amount: 0.18 }}
          whileInView="visible"
        >
          {productPackages.map((productPackage) => (
            <PackageCard key={productPackage.id} productPackage={productPackage} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

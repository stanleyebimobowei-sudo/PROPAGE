import { Leaf, Sparkles, UserRoundCheck } from 'lucide-react'

import productImage from '@/assets/product.jpeg'

const highlights = [
  {
    icon: Leaf,
    title: 'Ginger-inspired care',
    copy: 'A warming oil experience built around natural ginger-inspired ingredients and a polished daily routine.',
  },
  {
    icon: Sparkles,
    title: 'Healthy-looking finish',
    copy: 'Supports softness, shine, and a more nourished appearance for hair that looks cared for.',
  },
  {
    icon: UserRoundCheck,
    title: 'Hair and beard confidence',
    copy: 'Made for customers who want one premium oil for scalp care, hair styling, and light beard grooming.',
  },
] as const

export function AboutProductSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-linear-to-b from-[#050505] via-[#0d0b09] to-[#050505] px-4 py-18 text-white sm:px-6 lg:px-8 lg:py-28"
      aria-labelledby="about-product-heading"
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.055] p-3 shadow-[0_34px_100px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.12)]">
          <img
            src={productImage}
            alt="King of Ginger hair growth oil bottle"
            className="aspect-[4/5] w-full rounded-[30px] object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-x-6 bottom-6 rounded-[26px] border border-white/12 bg-ink-950/70 p-4 backdrop-blur-xl">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-gold-500">Daily oil routine</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-stone-200">
              Smooth texture, premium feel, and confidence-building presentation.
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-mint-400">About Ginger Hair Growth Oil</p>
          <h2 id="about-product-heading" className="mt-4 font-serif text-5xl font-normal leading-[0.95] tracking-normal lg:text-7xl">
            A premium oil for hair, beard, and everyday confidence
          </h2>
          <div className="mt-6 grid gap-5 text-base font-medium leading-8 text-stone-300 lg:text-lg">
            <p>
              King of Ginger is a rich grooming oil made for people who want their hair routine to feel intentional,
              polished, and easy to maintain. It is designed for scalp nourishment, daily shine, and a healthier-looking
              finish without feeling ordinary.
            </p>
            <p>
              Use it on natural hair, protective styles, edges, or apply a light amount to beard areas for a neat,
              conditioned appearance. The ginger-inspired profile brings warmth and character while the oil texture helps
              keep your routine simple and consistent.
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            {highlights.map(({ icon: Icon, title, copy }) => (
              <article className="flex gap-4 rounded-[26px] border border-white/10 bg-white/[0.045] p-4" key={title}>
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-mint-400/25 bg-mint-400/10 text-mint-400">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-black text-white">{title}</h3>
                  <p className="mt-1 text-sm font-medium leading-6 text-stone-400">{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

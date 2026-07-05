import { BadgeCheck, Droplets, PackageCheck, Sparkles, Sprout, WandSparkles } from 'lucide-react'

const benefits = [
  {
    icon: Sparkles,
    title: 'Supports healthier-looking hair',
    description: 'Designed for routines focused on shine, softness, and a fuller-looking appearance.',
  },
  {
    icon: Droplets,
    title: 'Helps nourish the scalp',
    description: 'A rich daily oil feel that supports a comfortable, well-conditioned scalp routine.',
  },
  {
    icon: BadgeCheck,
    title: 'Hair and beard care',
    description: 'Use it as part of your hair routine or apply lightly to beard areas for a neat groomed look.',
  },
  {
    icon: WandSparkles,
    title: 'Easy daily application',
    description: 'Simple bottle handling and a smooth texture make it easy to stay consistent.',
  },
  {
    icon: Sprout,
    title: 'Ginger-inspired formula',
    description: 'A natural ginger-inspired oil experience made for warmth, comfort, and daily confidence.',
  },
  {
    icon: PackageCheck,
    title: 'Premium packaging',
    description: 'Ships with a polished presentation that feels giftable, trustworthy, and ready to use.',
  },
] as const

export function BenefitsSection() {
  return (
    <section id="benefits" className="relative overflow-hidden bg-[#050505] px-4 py-18 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(52,211,153,0.1),transparent_26%),radial-gradient(circle_at_88%_18%,rgba(245,158,11,0.14),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl lg:mb-14">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-mint-400">Why customers choose it</p>
          <h2 className="mt-4 font-serif text-5xl font-normal leading-[0.95] tracking-normal text-white lg:text-7xl">
            Built for everyday confidence
          </h2>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-stone-300 lg:text-lg lg:leading-8">
            Premium care should be simple, consistent, and easy to trust. These benefits support a polished daily hair
            and beard routine without overpromising.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ icon: Icon, title, description }) => (
            <article
              className="rounded-[30px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl"
              key={title}
            >
              <span className="grid size-12 place-items-center rounded-2xl border border-gold-500/25 bg-gold-500/10 text-gold-500">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl font-black tracking-normal text-white">{title}</h3>
              <p className="mt-3 text-sm font-medium leading-6 text-stone-300">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

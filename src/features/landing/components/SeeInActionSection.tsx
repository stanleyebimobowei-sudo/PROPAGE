import { useEffect, useRef } from 'react'

import videoOne from '@/assets/see-action-1.mp4'
import videoTwo from '@/assets/see-action-2.mp4'

const actionCards = [
  {
    videoSrc: videoOne,
    title: 'Real application, real shine',
    description: 'Watch the oil glide through roots and strands with a clean, lightweight finish made for daily scalp care.',
  },
  {
    videoSrc: videoTwo,
    title: 'Made for visible routines',
    description: 'See the texture, bottle handling, and finish up close before adding King of Ginger to your hair routine.',
  },
] as const

export function SeeInActionSection() {
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([])

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)')

    if (!mobileQuery.matches) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement

          if (entry.isIntersecting) {
            video.play().catch(() => undefined)
            return
          }

          video.pause()
        })
      },
      { threshold: 0.55 },
    )

    videoRefs.current.forEach((video) => {
      if (video) {
        observer.observe(video)
      }
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section
      className="relative overflow-hidden bg-linear-to-b from-ink-950 via-[#11100e] to-earth-950 px-3 py-16 text-stone-100 md:px-8 md:py-20 lg:px-10 lg:py-24"
      aria-labelledby="see-in-action-heading"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.14),transparent_68%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_right,rgba(52,211,153,0.08),transparent_62%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-9 text-center md:mb-12">
          <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-mint-400">See in action</p>
          <h2 id="see-in-action-heading" className="font-serif text-4xl leading-tight text-stone-100 md:text-5xl">
            See the formula up close
          </h2>
        </div>

        <div className="grid grid-cols-1 justify-items-center gap-9 md:grid-cols-2 md:gap-8 lg:gap-10">
          {actionCards.map((card, index) => (
            <article
              className="w-[calc(100vw-24px)] max-w-[430px] overflow-hidden rounded-[26px] border border-gold-500/15 bg-[#171513] p-2.5 text-white shadow-[0_34px_90px_rgba(0,0,0,0.62),0_18px_54px_rgba(245,158,11,0.16),inset_0_1px_0_rgba(255,255,255,0.05)] md:w-full md:max-w-[520px] md:p-3 lg:max-w-[560px]"
              key={card.videoSrc}
            >
              <div className="overflow-hidden rounded-[18px] border border-white/5 bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                <video
                  ref={(element) => {
                    videoRefs.current[index] = element
                  }}
                  className="block aspect-[9/16] w-full bg-black object-contain md:aspect-[4/5]"
                  muted
                  playsInline
                  loop
                  preload="metadata"
                  controls={false}
                >
                  <source src={card.videoSrc} type="video/mp4" />
                </video>
              </div>

              <div className="px-6 pb-5 pt-6 text-center md:px-8 md:pb-7">
                <h3 className="font-sans text-lg font-bold tracking-[0.01em] text-stone-100 md:text-xl">{card.title}</h3>
                <p className="mx-auto mt-4 max-w-[340px] text-sm leading-6 text-stone-300 md:text-[0.95rem] md:leading-7">
                  {card.description}
                </p>
                <button
                  className="mx-auto mt-7 inline-flex items-center justify-center rounded-full border-2 border-ink-950/35 bg-linear-to-br from-gold-500 to-gold-600 px-7 py-3 text-sm font-black uppercase tracking-[0.1em] text-ink-950 shadow-[inset_0_2px_0_rgba(255,255,255,0.42),inset_0_-4px_0_rgba(0,0,0,0.22),0_0_0_3px_rgba(245,158,11,0.28),0_12px_34px_rgba(245,158,11,0.32)] outline outline-1 outline-offset-4 outline-gold-500/35 transition hover:-translate-y-0.5 hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-4 focus:ring-offset-[#171513]"
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('checkout:open'))}
                  aria-label={`Buy now: ${card.title}`}
                >
                  Buy now
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}


import { useEffect, useState } from 'react'

import brandSticker from '@/assets/brand-sticker-transparent.png'
import { Button } from '@/components/ui/Button'
import { RatingStars } from '@/components/ui/RatingStars'
import { SITE_CONFIG } from '@/constants/site'
import { useCheckoutEngine } from '@/features/checkout/hooks/CheckoutEngine'

import styles from './LandingHero.module.css'

type HeroCopyProps = {
  mobile?: boolean
}

export function HeroCopy({ mobile = false }: HeroCopyProps) {
  const [hideFloatingBuy, setHideFloatingBuy] = useState(false)
  const { openPopup } = useCheckoutEngine()
  const sectionClass = mobile
    ? 'relative flex w-full items-start justify-center px-7 pb-32 pt-9 md:pb-14'
    : 'relative flex w-1/2 items-center justify-center px-16 py-20 pl-[72px]'
  const eyebrowMargin = mobile ? 'mb-6' : 'mb-9'
  const headingFirstLine = mobile ? 'text-5xl' : 'text-[clamp(3.5rem,6vw,5.5rem)]'
  const headingSecondLine = mobile ? 'text-[2.75rem]' : 'text-[clamp(3.25rem,5.5vw,5.125rem)]'
  const dividerMargin = mobile ? 'my-6' : 'my-8'
  const paragraphMargin = mobile ? 'mb-9' : 'mb-12'
  const inlineButtonClass = mobile ? 'hidden md:inline-flex md:w-auto' : ''

  useEffect(() => {
    if (!mobile) {
      return undefined
    }

    const inlineCheckoutSection = document.querySelector('[data-inline-checkout-section="true"]')

    if (!inlineCheckoutSection) {
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHideFloatingBuy(entry.isIntersecting)
      },
      { threshold: 0.01 },
    )

    observer.observe(inlineCheckoutSection)

    return () => observer.disconnect()
  }, [mobile])

  return (
    <section className={sectionClass} id="formula" aria-labelledby="hero-heading">
      {!mobile ? <div className={styles.verticalRule} aria-hidden="true" /> : null}
      <div className={mobile ? 'w-full' : 'w-full max-w-[520px]'}>
        <div className={`${eyebrowMargin} flex items-center gap-2.5`}>
          <div className="h-px w-7 bg-mint-400" aria-hidden="true" />
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-mint-400">
            Scalp Nutrition Formula
          </p>
        </div>

        <h1 id="hero-heading" className="m-0 p-0 font-serif font-normal leading-[1.08]">
          <span className={`${headingFirstLine} block text-stone-100`}>7 days ginger</span>
          <span className={`${headingSecondLine} block italic text-gold-500`}>hair growth oil</span>
        </h1>

        <div className={`${styles.heroDivider} ${dividerMargin}`} aria-hidden="true" />

        <p className={`${paragraphMargin} max-w-[400px] text-[0.94rem] font-light leading-7 text-stone-copy`}>
          {SITE_CONFIG.description}
        </p>

        <Button className={inlineButtonClass} onClick={() => openPopup()} aria-label={`Buy ${SITE_CONFIG.productName}`}>
          buy product now
        </Button>

        <div className="mt-7">
          <RatingStars rating={4.9} reviewCount="2,400+" />
        </div>
      </div>

      {mobile ? (
        <div
          className={`fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pb-[env(safe-area-inset-bottom)] transition duration-300 md:hidden ${
            hideFloatingBuy ? 'pointer-events-none translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          <Button
            className="min-h-[68px] w-full max-w-[380px] px-7 pl-[70px] text-[1.05rem] font-black tracking-[0.08em] shadow-[inset_0_2px_0_rgba(255,255,255,0.45),inset_0_-5px_0_rgba(0,0,0,0.24),0_0_0_4px_rgba(245,158,11,0.34),0_20px_54px_rgba(245,158,11,0.46),0_8px_20px_rgba(0,0,0,0.45)]"
            onClick={() => openPopup()}
            aria-label={`Buy ${SITE_CONFIG.productName}`}
          >
            <img
              src={brandSticker}
              alt=""
              className="brand-sticker-shake absolute left-3 size-12 object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.32)]"
              aria-hidden="true"
            />
            <span>buy product now</span>
          </Button>
        </div>
      ) : null}
    </section>
  )
}

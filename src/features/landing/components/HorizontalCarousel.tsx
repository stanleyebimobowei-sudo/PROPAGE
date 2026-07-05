import { ProductCard } from '@/features/landing/components/ProductCard'
import { productCards } from '@/features/landing/data/productData'
import { MobileProductCard } from '@/features/landing/components/MobileProductCard'

import styles from './LandingHero.module.css'

type MarqueeRowProps = {
  direction: 'left' | 'right'
}

function MarqueeRow({ direction }: MarqueeRowProps) {
  const animationClass = direction === 'left' ? styles.marqueeLeft : styles.marqueeRight
  const cards = [...productCards, ...productCards, ...productCards]

  return (
    <div className="w-full overflow-hidden">
      <div className={`flex w-max gap-3 will-change-transform ${animationClass}`}>
        {cards.map((card, index) => (
          <div className="w-[200px] shrink-0" key={`${card.id}-${direction}-${index}`}>
            <ProductCard product={card} compact />
          </div>
        ))}
      </div>
    </div>
  )
}

export function HorizontalCarousel() {
  const premiumCards = [...productCards, ...productCards]

  return (
    <>
      <section className="relative overflow-hidden pb-4 pt-3 md:hidden" aria-label="Featured product carousel">
        <div className={styles.mobilePremiumGlow} aria-hidden="true" />
        <div className={styles.mobilePremiumViewport}>
          <div className={styles.mobilePremiumTrack}>
            {premiumCards.map((card, index) => (
              <div
                className={styles.mobilePremiumSlide}
                key={`${card.id}-premium-${index}`}
                aria-hidden={index >= productCards.length}
              >
                <MobileProductCard product={card} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative hidden w-full flex-col gap-3 overflow-hidden pb-1 pt-2 md:flex"
        aria-label="Product gallery"
      >
        <div className={styles.leftFade} aria-hidden="true" />
        <div className={styles.rightFade} aria-hidden="true" />
        <MarqueeRow direction="left" />
        <MarqueeRow direction="right" />
      </section>
    </>
  )
}

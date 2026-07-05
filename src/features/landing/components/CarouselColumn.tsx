import { ProductCard } from '@/features/landing/components/ProductCard'
import { productCards } from '@/features/landing/data/productData'

import styles from './LandingHero.module.css'

type CarouselColumnProps = {
  direction: 'up' | 'down'
}

export function CarouselColumn({ direction }: CarouselColumnProps) {
  const animationClass = direction === 'up' ? styles.scrollUpFast : styles.scrollDownMedium
  const cards = [...productCards, ...productCards]

  return (
    <div className="relative h-full flex-1 overflow-hidden">
      <div className={`flex flex-col gap-3.5 will-change-transform ${animationClass}`}>
        {cards.map((card, index) => (
          <ProductCard key={`${card.id}-${index}`} product={card} />
        ))}
      </div>
    </div>
  )
}

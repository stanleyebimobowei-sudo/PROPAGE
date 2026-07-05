import type { ProductDisplayCard } from '@/features/landing/types/product'

import styles from './LandingHero.module.css'

type MobileProductCardProps = {
  product: ProductDisplayCard
}

export function MobileProductCard({ product }: MobileProductCardProps) {
  return (
    <article className={styles.mobilePremiumCard}>
      <img src={product.imageSrc} alt={product.imageAlt} className={styles.mobilePremiumImage} loading="lazy" />
    </article>
  )
}

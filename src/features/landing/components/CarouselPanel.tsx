import { CarouselColumn } from '@/features/landing/components/CarouselColumn'

import styles from './LandingHero.module.css'

export function CarouselPanel() {
  return (
    <section className={styles.carouselPanel} id="results" aria-label="Product result gallery">
      <div className={styles.topFade} aria-hidden="true" />
      <div className={styles.bottomFade} aria-hidden="true" />
      <div className={styles.sideGlow} aria-hidden="true" />
      <CarouselColumn direction="up" />
      <CarouselColumn direction="down" />
    </section>
  )
}

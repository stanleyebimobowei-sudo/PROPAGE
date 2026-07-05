import { CarouselPanel } from '@/features/landing/components/CarouselPanel'
import { HeroCopy } from '@/features/landing/components/HeroCopy'
import { HorizontalCarousel } from '@/features/landing/components/HorizontalCarousel'

import styles from './LandingHero.module.css'

export function LandingHero() {
  return (
    <div className={styles.heroShell} id="hero">
      <div className={styles.heroGlow} aria-hidden="true" />

      <div className={styles.desktopHero}>
        <HeroCopy />
        <CarouselPanel />
      </div>

      <div className={styles.mobileHero}>
        <div className="relative z-10 pt-[52px]">
          <HorizontalCarousel />
        </div>
        <div className="relative z-10">
          <HeroCopy mobile />
        </div>
      </div>
    </div>
  )
}

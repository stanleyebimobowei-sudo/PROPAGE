import { InlineCheckout } from '@/features/checkout/components/InlineCheckout'
import { AboutProductSection } from '@/features/landing/components/AboutProductSection'
import { BenefitsSection } from '@/features/landing/components/BenefitsSection'
import { DisclaimerSection } from '@/features/landing/components/DisclaimerSection'
import { FAQSection } from '@/features/landing/components/FAQSection'
import { GallerySection } from '@/features/landing/components/GallerySection'
import { LandingHero } from '@/features/landing/components/LandingHero'
import { CustomerReviewsSection } from '@/features/landing/components/CustomerReviewsSection'
import { ProductPackages } from '@/features/landing/components/ProductPackages'
import { SeeInActionSection } from '@/features/landing/components/SeeInActionSection'
import { UnderHeroImages } from '@/features/landing/components/UnderHeroImages'

export default function LandingPage() {
  return (
    <>
      <LandingHero />
      <UnderHeroImages />
      <SeeInActionSection />
      <CustomerReviewsSection />
      <ProductPackages />
      <BenefitsSection />
      <GallerySection />
      <AboutProductSection />
      <InlineCheckout />
      <FAQSection />
      <DisclaimerSection />
    </>
  )
}

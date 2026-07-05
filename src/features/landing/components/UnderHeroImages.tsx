import underHeroImageOne from '@/assets/mobile-under-hero-1.jpeg'
import underHeroImageTwo from '@/assets/mobile-under-hero-2.jpeg'

const underHeroImages = [
  {
    src: underHeroImageOne,
    alt: 'Ginger hair growth oil product showcase',
  },
  {
    src: underHeroImageTwo,
    alt: 'Ginger hair growth oil result showcase',
  },
] as const

export function UnderHeroImages() {
  return (
    <section className="bg-ink-950 md:px-6 md:py-10 lg:px-10 lg:py-14" aria-label="Product details and results">
      <div className="mx-auto grid w-full grid-cols-1 gap-0 md:max-w-5xl md:grid-cols-2 md:gap-6 lg:max-w-7xl lg:gap-8">
        {underHeroImages.map((image) => (
          <figure className="m-0 w-full overflow-visible" key={image.src}>
            <img src={image.src} alt={image.alt} className="block h-auto w-full rounded-none object-contain" loading="lazy" />
          </figure>
        ))}
      </div>
    </section>
  )
}

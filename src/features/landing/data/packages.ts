const packageImageModules = import.meta.glob<string>('../../../../PACKAGE/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url',
})

const packageImages = Object.entries(packageImageModules)
  .sort(([firstPath], [secondPath]) => firstPath.localeCompare(secondPath, undefined, { numeric: true }))
  .map(([, imageSrc]) => imageSrc)

export type BenefitIcon = 'delivery' | 'payment' | 'guarantee'

export type PackageBenefit = {
  icon: BenefitIcon
  label: string
}

export type ProductPackage = {
  id: string
  image: string
  imageAlt: string
  title: string
  product: string
  offer: string[]
  totalBottles?: string
  promoPrice: string
  oldPrice: string
  savedAmount: string
  discount?: string
  badge?: {
    label: string
    tone: 'popular' | 'value'
  }
  description: string
  benefits: PackageBenefit[]
  buttonText: string
}

export const defaultBenefits: PackageBenefit[] = [
  { icon: 'delivery', label: 'Free Delivery' },
  { icon: 'payment', label: 'Payment on Delivery' },
  { icon: 'guarantee', label: '100% Money-back Guarantee' },
]

export const productPackages: ProductPackage[] = [
  {
    id: 'buy-1-bottle',
    image: packageImages[0],
    imageAlt: 'One bottle package of Ginger Hair Growth Oil',
    title: 'Buy 1 Bottle',
    product: 'Ginger Hair Growth Oil',
    offer: ['1 Bottle'],
    promoPrice: '₦20,000',
    oldPrice: '₦28,500',
    savedAmount: 'Save ₦8,500',
    discount: 'Limited-time promo',
    description: 'A focused starter bottle for trying the 7-day growth oil routine.',
    benefits: defaultBenefits,
    buttonText: 'Buy Now',
  },
  {
    id: 'buy-2-get-1',
    image: packageImages[1],
    imageAlt: 'Three bottle package of Ginger Hair Growth Oil',
    title: 'Buy 2 Bottles',
    product: 'Ginger Hair Growth Oil',
    offer: ['Buy 2 Bottles', 'Get 1 FREE'],
    totalBottles: '3 Bottles',
    promoPrice: '₦40,000',
    oldPrice: '₦57,000',
    savedAmount: 'Save ₦17,000',
    discount: 'Limited-time promo',
    badge: { label: '🔥 Most Popular', tone: 'popular' },
    description: 'The best everyday bundle for staying consistent without running out.',
    benefits: defaultBenefits,
    buttonText: 'Buy Now',
  },
  {
    id: 'buy-3-get-2',
    image: packageImages[2],
    imageAlt: 'Five bottle package of Ginger Hair Growth Oil',
    title: 'Buy 3 Bottles',
    product: 'Ginger Hair Growth Oil',
    offer: ['Buy 3 Bottles', 'Get 2 FREE'],
    totalBottles: '5 Bottles',
    promoPrice: '₦60,000',
    oldPrice: '₦85,500',
    savedAmount: 'Save ₦25,500',
    discount: 'Limited-time promo',
    badge: { label: '⭐ Best Value', tone: 'value' },
    description: 'Maximum savings for a complete routine or family use.',
    benefits: defaultBenefits,
    buttonText: 'Buy Now',
  },
]

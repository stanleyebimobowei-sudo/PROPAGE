import type { Product, ProductDisplayCard } from '@/features/landing/types/product'

import heroImage1 from '../../../../hero/WhatsApp Image 2026-07-02 at 3.13.46 PM (2).jpeg'
import heroImage2 from '../../../../hero/WhatsApp Image 2026-07-02 at 3.13.47 PM.jpeg'
import heroImage3 from '../../../../hero/WhatsApp Image 2026-07-02 at 3.13.47 PM (1).jpeg'
import heroImage4 from '../../../../hero/WhatsApp Image 2026-07-02 at 3.13.47 PM (2).jpeg'
import heroImage5 from '../../../../hero/WhatsApp Image 2026-07-02 at 3.13.47 PM (3).jpeg'
import heroImage6 from '../../../../hero/WhatsApp Image 2026-07-02 at 3.13.49 PM.jpeg'
import heroImage7 from '../../../../hero/WhatsApp Image 2026-07-02 at 3.13.49 PM (1).jpeg'
import heroImage8 from '../../../../hero/WhatsApp Image 2026-07-02 at 3.13.49 PM (2).jpeg'

const heroImages = [heroImage1, heroImage2, heroImage3, heroImage4, heroImage5, heroImage6, heroImage7, heroImage8]

export const heroProduct: Omit<Product, 'imageSrc'> = {
  id: 'ginger-oil-30ml',
  brand: 'King of Ginger',
  name: '7 Days Hair Growth Oil',
  size: '30ml',
  imageAlt: 'King of Ginger 7 Days Hair Growth Oil bottle and retail box',
}

export const productCards: ProductDisplayCard[] = heroImages.map((imageSrc, index) => ({
  ...heroProduct,
  id: `${heroProduct.id}-${index + 1}`,
  imageSrc,
  variant: index % 2 === 0 ? 'tall' : 'wide',
  accentDivider: index % 3 === 0,
}))

export type ProductCardVariant = 'tall' | 'wide'

export type Product = {
  id: string
  brand: string
  name: string
  size: string
  imageSrc: string
  imageAlt: string
}

export type ProductDisplayCard = Product & {
  variant: ProductCardVariant
  accentDivider?: boolean
}

export type Gender = 'male' | 'female' | 'unisex'
export type Style = 'all_mountain' | 'freeride' | 'freestyle'

export interface CategoryFilters {
  gender: Gender | ''
  styles: Style[]
}

export interface Snowboard {
  id: number
  title: string
  description: string
  shape: string
  price: number
  discountPercentage: number
  brand: string
  stock: number
  style: Style[]
  gender: Gender
  sizes: number[]
  stiffness: number
}

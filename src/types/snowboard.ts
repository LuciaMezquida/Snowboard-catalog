export type Gender = 'male' | 'female' | 'unisex'

export interface Snowboard {
  id: number
  title: string
  description: string
  shape: string
  price: number
  discountPercentage: number
  brand: string
  stock: number
  style: string[]
  gender: Gender
  sizes: number[]
  stiffness: number
}

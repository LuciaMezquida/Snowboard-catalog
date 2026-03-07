/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '@/data/snowboards.json' {
  const data: {
    products: Array<{
      id: number
      title: string
      description: string
      shape: string
      price: number
      discountPercentage: number
      brand: string
      stock: number
      style: string[]
      gender: string
      sizes: number[]
      stiffness: number
    }>
    total: number
    skip: number
    limit: number
  }
  export default data
}

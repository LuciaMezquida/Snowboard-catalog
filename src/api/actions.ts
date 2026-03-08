import type { Snowboard } from '@/types/snowboard'

const SNOWBOARDS_API_URL = 'https://dummyjson.com/c/5ab5-caac-4d58-81cf'

export interface SnowboardsResponse {
  products: Snowboard[]
  total?: number
  skip?: number
  limit?: number
}

export async function fetchSnowboards(limit = 10, skip = 0): Promise<SnowboardsResponse> {
  const url = `${SNOWBOARDS_API_URL}?limit=${limit}&skip=${skip}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch snowboards')
  const data = (await res.json()) as SnowboardsResponse

  if (data.total === undefined && Array.isArray(data.products)) {
    const allProducts = data.products
    const products = allProducts.slice(skip, skip + limit)
    return {
      products,
      total: allProducts.length,
      skip,
      limit,
    }
  }

  return data
}

import type { Snowboard } from '@/types/snowboard'

const SNOWBOARDS_API_URL = 'https://dummyjson.com/c/5ab5-caac-4d58-81cf'
export const QUERY_LIMIT = 10

let allSnowboards: Snowboard[] | null = null

export interface SnowboardsResponse {
  products: Snowboard[]
  total?: number
  skip?: number
  limit?: number
}

export async function fetchSnowboards(limit = QUERY_LIMIT, skip = 0): Promise<SnowboardsResponse> {
  const url = `${SNOWBOARDS_API_URL}?limit=${limit}&skip=${skip}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch snowboards')
  const data = (await res.json()) as SnowboardsResponse

  if (data.total === undefined && Array.isArray(data.products)) {
    const allProducts = data.products
    const products = limit === 0 ? allProducts : allProducts.slice(skip, skip + limit)
    return {
      products,
      total: allProducts.length,
      skip,
      limit: limit,
    }
  }

  return data
}

async function fetchAllSnowboards(): Promise<Snowboard[]> {
  if (allSnowboards) return allSnowboards
  const res = await fetchSnowboards(0, 0)
  allSnowboards = res.products
  return allSnowboards
}

function matchesSearch(product: Snowboard, searchValue: string): boolean {
  const value = searchValue.toLowerCase().trim()
  const fields = [product.title, product.brand]
  return fields.some((f) => String(f).toLowerCase().includes(value))
}

export async function searchSnowboards(searchValue: string): Promise<SnowboardsResponse> {
  if (!searchValue.trim()) {
    return fetchSnowboards(QUERY_LIMIT, 0)
  }
  const all = await fetchAllSnowboards()
  const filtered = all.filter((p) => matchesSearch(p, searchValue))
  return {
    products: filtered,
    total: filtered.length,
    skip: 0,
    limit: filtered.length,
  }
}

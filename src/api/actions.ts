import type { Snowboard, CategoryFilters } from '@/types/snowboard'

const SNOWBOARDS_API_URL = 'https://dummyjson.com/c/5ab5-caac-4d58-81cf'
export const QUERY_LIMIT = 10

let allSnowboards: Snowboard[] | null = null

export interface SnowboardsResponse {
  products: Snowboard[]
  total?: number
  skip?: number
  limit?: number
}

// Read

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

// Search and filters

function matchesSearch(product: Snowboard, searchValue: string): boolean {
  const value = searchValue.toLowerCase().trim()
  const fields = [product.title, product.brand]
  return fields.some((f) => String(f).toLowerCase().includes(value))
}

function matchesCategoryFilters(product: Snowboard, filters: CategoryFilters): boolean {
  if (filters.gender && product.gender !== filters.gender) return false
  if (filters.styles.length > 0) {
    const hasStyle = filters.styles.some((s) => product.style?.includes(s))
    if (!hasStyle) return false
  }
  return true
}

export async function fetchSnowboardsFiltered(
  searchValue: string,
  filters: CategoryFilters
): Promise<SnowboardsResponse> {
  const all = await fetchAllSnowboards()
  let filtered = all
  if (searchValue.trim()) {
    filtered = filtered.filter((product) => matchesSearch(product, searchValue))
  }
  if (filters.gender || filters.styles.length > 0) {
    filtered = filtered.filter((product) => matchesCategoryFilters(product, filters))
  }
  return {
    products: filtered,
    total: filtered.length,
    skip: 0,
    limit: filtered.length,
  }
}

// Mutations

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${SNOWBOARDS_API_URL}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete product')
}

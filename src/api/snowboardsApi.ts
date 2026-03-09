import type { Snowboard, CategoryFilters } from '@/types/snowboard'

const SNOWBOARDS_API_URL = 'https://dummyjson.com/c/5ab5-caac-4d58-81cf'
export const SNOWBOARDS_API_QUERY_LIMIT = 10

let allSnowboards: Snowboard[] | null = null

export interface SnowboardsResponse {
  products: Snowboard[]
  total?: number
  skip?: number
  limit?: number
}

export interface FetchSnowboardsParams {
  searchQuery?: string
  gender?: CategoryFilters['gender']
  styles?: CategoryFilters['styles']
  limit?: number
  skip?: number
}

/**
 * Builds API URL with pagination (?limit=&skip=), search (/search?q=), and category params.
 * Use when backend supports these params; DummyJSON custom collection does not.
 */
function buildFetchUrl(params: FetchSnowboardsParams): string {
  const {
    searchQuery = '',
    gender = '',
    styles = [],
    limit = SNOWBOARDS_API_QUERY_LIMIT,
    skip = 0,
  } = params
  const searchParams = new URLSearchParams()
  if (limit > 0) searchParams.set('limit', String(limit))
  searchParams.set('skip', String(skip))
  if (searchQuery.trim()) searchParams.set('q', searchQuery.trim())
  if (gender) searchParams.set('gender', gender)
  styles.forEach((s) => searchParams.append('style', s))

  const query = searchParams.toString()
  const basePath = searchQuery.trim() ? `${SNOWBOARDS_API_URL}/search` : SNOWBOARDS_API_URL
  return query ? `${basePath}?${query}` : basePath
}

async function fetchFromApi(url: string): Promise<SnowboardsResponse> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch snowboards')
  return (await res.json()) as SnowboardsResponse
}

export function invalidateSnowboardsCache(): void {
  allSnowboards = null
}

// Search and filters (used for client-side fallback when API doesn't support params)

export function matchesSearch(product: Snowboard, searchValue: string): boolean {
  const value = searchValue.toLowerCase().trim()
  const fields = [product.title, product.brand]
  return fields.some((f) => String(f).toLowerCase().includes(value))
}

export function matchesCategoryFilters(product: Snowboard, filters: CategoryFilters): boolean {
  if (filters.gender && product.gender !== filters.gender) return false
  if (filters.styles.length > 0) {
    const hasStyle = filters.styles.some((s) => product.style?.includes(s))
    if (!hasStyle) return false
  }
  return true
}

function applyClientSideFilter(
  products: Snowboard[],
  searchQuery: string,
  filters: CategoryFilters
): Snowboard[] {
  let filtered = products
  if (searchQuery.trim()) {
    filtered = filtered.filter((p) => matchesSearch(p, searchQuery))
  }
  if (filters.gender || filters.styles.length > 0) {
    filtered = filtered.filter((p) => matchesCategoryFilters(p, filters))
  }
  return filtered
}

/**
 * Fetches snowboards with pagination (?limit=&skip=), search (/search?q=), and category filters.
 * DummyJSON custom collection may not support these params server-side; we apply client-side
 * filtering as fallback. Returns full filtered set for store merge; pagination is applied
 * by the store after merging with local state.
 */
export async function fetchSnowboardsFiltered(
  params: FetchSnowboardsParams
): Promise<SnowboardsResponse> {
  const { searchQuery = '', gender = '', styles = [] } = params
  const filters: CategoryFilters = { gender, styles }

  // Fetch full dataset (cached); DummyJSON returns all regardless of params
  if (!allSnowboards) {
    const url = buildFetchUrl({ ...params, limit: 0 })
    const data = await fetchFromApi(url)
    allSnowboards = Array.isArray(data.products) ? data.products : []
  }
  const rawProducts = allSnowboards

  // Apply search and category filters client-side
  const filtered = applyClientSideFilter(rawProducts, searchQuery, filters)

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

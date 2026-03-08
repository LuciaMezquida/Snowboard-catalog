import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Snowboard, CategoryFilters as CategoryFiltersType } from '@/types/snowboard'
import {
  fetchSnowboards,
  fetchSnowboardsFiltered,
  createProduct,
  updateProduct,
  deleteProduct,
  invalidateSnowboardsCache,
  QUERY_LIMIT,
} from '@/api/actions'
import type { CreateSnowboardPayload, UpdateSnowboardPayload } from '@/api/actions'

export const useSnowboardsStore = defineStore('snowboards', () => {
  const snowboards = ref<Snowboard[]>([])
  const page = ref(0)
  const limit = QUERY_LIMIT
  const total = ref(0)
  const searchQuery = ref('')
  const gender = ref<CategoryFiltersType['gender']>('')
  const styles = ref<CategoryFiltersType['styles']>([])

  const deletedIds = ref<Set<number>>(new Set())

  const hasFilters = computed(() => !!gender.value || styles.value.length > 0)

  const displayedSnowboards = computed(() => {
    if (!searchQuery.value.trim() && !hasFilters.value) return snowboards.value
    const start = page.value * limit
    return snowboards.value.slice(start, start + limit)
  })

  async function loadPage() {
    if (searchQuery.value.trim() || hasFilters.value) {
      const response = await fetchSnowboardsFiltered(searchQuery.value, {
        gender: gender.value,
        styles: styles.value,
      })
      const filtered = response.products.filter((product) => !deletedIds.value.has(product.id))
      snowboards.value = filtered
      total.value = filtered.length
    } else {
      const response = await fetchSnowboards(limit, page.value * limit)
      const filtered = response.products.filter((product) => !deletedIds.value.has(product.id))
      snowboards.value = filtered
      const apiResponseTotal = response.total ?? response.products.length
      total.value = Math.max(0, apiResponseTotal - deletedIds.value.size)
    }
  }

  async function runSearch() {
    page.value = 0
    if (!searchQuery.value.trim() && !hasFilters.value) {
      snowboards.value = []
      await loadPage()
      return
    }
    await loadPage()
  }

  async function createSnowboard(payload: CreateSnowboardPayload): Promise<Snowboard> {
    const created = await createProduct(payload)
    invalidateSnowboardsCache()
    snowboards.value = [created, ...snowboards.value]
    total.value++
    return created
  }

  async function updateSnowboard(id: number, payload: UpdateSnowboardPayload): Promise<Snowboard> {
    const updated = await updateProduct(id, payload)
    invalidateSnowboardsCache()
    const index = snowboards.value.findIndex((s) => s.id === id)
    if (index >= 0) snowboards.value[index] = updated
    return updated
  }

  async function deleteSnowboard(id: number) {
    await deleteProduct(id)
    deletedIds.value = new Set([...deletedIds.value, id])
    snowboards.value = snowboards.value.filter((s) => s.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  function setPage(value: number) {
    page.value = value
  }

  function nextPage() {
    if ((page.value + 1) * limit < total.value) {
      page.value++
      if (!searchQuery.value.trim() && !hasFilters.value) loadPage()
    }
  }

  function prevPage() {
    if (page.value > 0) {
      page.value--
      if (!searchQuery.value.trim() && !hasFilters.value) loadPage()
    }
  }

  return {
    snowboards,
    page,
    total,
    limit,
    searchQuery,
    gender,
    styles,
    displayedSnowboards,
    hasFilters,
    loadPage,
    runSearch,
    createSnowboard,
    updateSnowboard,
    deleteSnowboard,
    setPage,
    nextPage,
    prevPage,
  }
})

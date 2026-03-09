import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Snowboard, CategoryFilters as CategoryFiltersType } from '@/types/snowboard'
import {
  fetchSnowboardsFiltered,
  invalidateSnowboardsCache,
  matchesSearch,
  matchesCategoryFilters,
  SNOWBOARDS_API_QUERY_LIMIT,
} from '@/api/snowboardsApi'

export type CreateSnowboardPayload = Omit<Snowboard, 'id'>
export type UpdateSnowboardPayload = Partial<CreateSnowboardPayload>

export const useSnowboardsStore = defineStore('snowboards', () => {
  const snowboards = ref<Snowboard[]>([])
  const page = ref(0)
  const limit = SNOWBOARDS_API_QUERY_LIMIT
  const total = ref(0)
  const searchQuery = ref('')
  const gender = ref<CategoryFiltersType['gender']>('')
  const styles = ref<CategoryFiltersType['styles']>([])

  const deletedIds = ref<Set<number>>(new Set())
  const localCreated = ref<Snowboard[]>([])
  const localUpdated = ref<Map<number, Snowboard>>(new Map())
  const nextLocalIdCounter = ref(0)

  const hasFilters = computed(() => !!gender.value || styles.value.length > 0)

  const displayedSnowboards = computed(() => {
    const start = page.value * limit
    return snowboards.value.slice(start, start + limit)
  })

  function mergeWithLocal(apiProducts: Snowboard[]): Snowboard[] {
    const updated = new Map(localUpdated.value)
    const filters = { gender: gender.value, styles: styles.value }
    const created = localCreated.value
      .filter((p) => {
        if (searchQuery.value.trim() && !matchesSearch(p, searchQuery.value)) return false
        if (!matchesCategoryFilters(p, filters)) return false
        return true
      })
      .map((p) => updated.get(p.id) ?? p)
    const merged = apiProducts
      .filter((p) => !deletedIds.value.has(p.id))
      .map((p) => updated.get(p.id) ?? p)
    return [...created, ...merged]
  }

  async function loadPage() {
    const response = await fetchSnowboardsFiltered({
      searchQuery: searchQuery.value,
      gender: gender.value,
      styles: styles.value,
      limit,
      skip: page.value * limit,
    })
    const merged = mergeWithLocal(response.products)
    total.value = merged.length
    snowboards.value = merged
  }

  async function runSearch() {
    page.value = 0
    await loadPage()
  }

  function nextLocalId(): number {
    nextLocalIdCounter.value--
    return nextLocalIdCounter.value
  }

  async function createSnowboard(payload: CreateSnowboardPayload): Promise<Snowboard> {
    const id = nextLocalId()
    const created: Snowboard = { ...payload, id }
    localCreated.value = [created, ...localCreated.value]
    invalidateSnowboardsCache()
    await loadPage()
    return created
  }

  async function updateSnowboard(id: number, payload: UpdateSnowboardPayload): Promise<Snowboard> {
    const existing =
      snowboards.value.find((s) => s.id === id) ??
      localUpdated.value.get(id) ??
      localCreated.value.find((s) => s.id === id)
    const updated: Snowboard = { ...existing, ...payload, id } as Snowboard
    localUpdated.value = new Map(localUpdated.value)
    localUpdated.value.set(id, updated)
    invalidateSnowboardsCache()
    const index = snowboards.value.findIndex((s) => s.id === id)
    if (index >= 0) {
      snowboards.value = [
        ...snowboards.value.slice(0, index),
        updated,
        ...snowboards.value.slice(index + 1),
      ]
    }
    return updated
  }

  async function deleteSnowboard(id: number) {
    deletedIds.value = new Set([...deletedIds.value, id])
    localCreated.value = localCreated.value.filter((s) => s.id !== id)
    localUpdated.value = new Map(localUpdated.value)
    localUpdated.value.delete(id)
    await loadPage()
  }

  function nextPage() {
    if ((page.value + 1) * limit < total.value) page.value++
  }

  function prevPage() {
    if (page.value > 0) page.value--
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
    nextPage,
    prevPage,
  }
})

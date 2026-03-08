<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import SnowboardsTable from './components/SnowboardsTable/SnowboardsTable.vue'
import { fetchSnowboards, fetchSnowboardsFiltered, QUERY_LIMIT } from '@/api/actions'
import type { Snowboard, CategoryFilters as CategoryFiltersType } from '@/types/snowboard'

const snowboards = ref<Snowboard[]>([])
const page = ref(0)
const limit = QUERY_LIMIT
const total = ref(0)
const searchQuery = ref('')
const gender = ref<CategoryFiltersType['gender']>('')
const styles = ref<CategoryFiltersType['styles']>([])

const hasFilters = computed(() => !!gender.value || styles.value.length > 0)

async function loadPage() {
  if (searchQuery.value.trim() || hasFilters.value) {
    const response = await fetchSnowboardsFiltered(searchQuery.value, {
      gender: gender.value,
      styles: styles.value,
    })
    snowboards.value = response.products
    total.value = response.total ?? response.products.length
  } else {
    const response = await fetchSnowboards(limit, page.value * limit)
    snowboards.value = response.products
    total.value = response.total ?? response.products.length
  }
}

const displayedSnowboards = computed(() => {
  if (!searchQuery.value.trim() && !hasFilters.value) return snowboards.value
  const start = page.value * limit
  return snowboards.value.slice(start, start + limit)
})

async function runSearch() {
  page.value = 0
  if (!searchQuery.value.trim() && !hasFilters.value) {
    snowboards.value = []
    await loadPage()
    return
  }
  await loadPage()
}

const debouncedSearch = useDebounceFn(runSearch, 300)

watch(searchQuery, () => {
  page.value = 0
  debouncedSearch()
})

watch(
  [gender, styles],
  () => {
    page.value = 0
    runSearch()
  },
  { deep: true }
)

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

onMounted(loadPage)
</script>

<template>
  <main>
    <h1 class="pb-8 text-2xl font-bold text-gray-700 dark:text-gray-300">Snowboards catalog</h1>
    <SnowboardsTable
      v-model:search-query="searchQuery"
      v-model:gender="gender"
      v-model:styles="styles"
      :snowboards="displayedSnowboards"
      :page="page"
      :total="total"
      :limit="limit"
      :on-prev-page="prevPage"
      :on-next-page="nextPage"
    />
  </main>
</template>

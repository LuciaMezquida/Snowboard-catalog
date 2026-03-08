<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import SnowboardsTable from './components/SnowboardsTable/SnowboardsTable.vue'
import { fetchSnowboards, searchSnowboards, QUERY_LIMIT } from '@/api/actions'
import type { Snowboard } from '@/types/snowboard'

const snowboards = ref<Snowboard[]>([])
const page = ref(0)
const limit = QUERY_LIMIT
const total = ref(0)
const searchQuery = ref('')

async function loadPage() {
  const response = await fetchSnowboards(limit, page.value * limit)
  snowboards.value = response.products
  total.value = response.total ?? response.products.length
}

const displayedSnowboards = computed(() => {
  if (!searchQuery.value.trim()) return snowboards.value
  const start = page.value * limit
  return snowboards.value.slice(start, start + limit)
})

async function runSearch() {
  if (!searchQuery.value.trim()) {
    page.value = 0
    snowboards.value = []
    await loadPage()
    return
  }
  const searchResponse = await searchSnowboards(searchQuery.value)
  snowboards.value = searchResponse.products
  total.value = searchResponse.total ?? searchResponse.products.length
  page.value = 0
}

const debouncedSearch = useDebounceFn(runSearch, 300)

watch(searchQuery, () => {
  page.value = 0
  debouncedSearch()
})

function nextPage() {
  if ((page.value + 1) * limit < total.value) {
    page.value++
    if (!searchQuery.value.trim()) loadPage()
  }
}

function prevPage() {
  if (page.value > 0) {
    page.value--
    if (!searchQuery.value.trim()) loadPage()
  }
}

onMounted(loadPage)
</script>

<template>
  <main>
    <h1 class="pb-8 text-2xl font-bold text-gray-700 dark:text-gray-300">Snowboards catalog</h1>
    <SnowboardsTable
      v-model:search-query="searchQuery"
      :snowboards="displayedSnowboards"
      :page="page"
      :total="total"
      :limit="limit"
      :on-prev-page="prevPage"
      :on-next-page="nextPage"
    />
  </main>
</template>

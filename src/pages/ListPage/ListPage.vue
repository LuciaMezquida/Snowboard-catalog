<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import SnowboardsTable from './components/SnowboardsTable/SnowboardsTable.vue'
import { useSnowboardsStore } from '@/stores/snowboards'

const store = useSnowboardsStore()
const { searchQuery, gender, styles, displayedSnowboards, page, total } = storeToRefs(store)

const debouncedSearch = useDebounceFn(store.runSearch, 300)

watch(searchQuery, () => {
  page.value = 0
  debouncedSearch()
})

watch(
  [gender, styles],
  () => {
    page.value = 0
    store.runSearch()
  },
  { deep: true }
)

onMounted(store.loadPage)
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
      :limit="store.limit"
      :on-prev-page="store.prevPage"
      :on-next-page="store.nextPage"
      :on-delete="store.deleteSnowboard"
    />
  </main>
</template>

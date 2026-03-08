<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SnowboardsTable from './components/SnowboardsTable/SnowboardsTable.vue'
import { fetchSnowboards } from '@/api/actions'
import type { Snowboard } from '@/types/snowboard'

const snowboards = ref<Snowboard[]>([])
const page = ref(0)
const limit = 10
const total = ref(0)

async function loadPage() {
  const res = await fetchSnowboards(limit, page.value * limit)
  snowboards.value = res.products
  total.value = res.total ?? res.products.length
}

function nextPage() {
  if ((page.value + 1) * limit < total.value) {
    page.value++
    loadPage()
  }
}

function prevPage() {
  if (page.value > 0) {
    page.value--
    loadPage()
  }
}

onMounted(loadPage)
</script>

<template>
  <main>
    <SnowboardsTable
      :snowboards="snowboards"
      :page="page"
      :total="total"
      :limit="limit"
      :on-prev-page="prevPage"
      :on-next-page="nextPage"
    />
  </main>
</template>

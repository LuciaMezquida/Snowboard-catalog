<script setup lang="ts">
import SnowboardsTable from './components/SnowboardsTable.vue'
import snowboardsData from '@/data/snowboards.json'
import type { Snowboard } from '@/types/snowboard'

const snowboards = snowboardsData.products as Snowboard[]
</script>

<template>
  <main>
    <SnowboardsTable :snowboards="snowboards" />
  </main>
</template>

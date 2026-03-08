<script setup lang="ts">
import { h } from 'vue'
import { FlexRender, createColumnHelper, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import type { Snowboard } from '@/types/snowboard'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-vue-next'

const STYLE_BADGE_CLASSES: Record<string, string> = {
  all_mountain:
    'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  freestyle:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  freeride:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
}

function formatStyleLabel(style: string): string {
  return style.replace(/_/g, ' ')
}

function getStyleBadgeClass(style: string): string {
  return STYLE_BADGE_CLASSES[style] ?? 'bg-muted text-muted-foreground border-border'
}

const props = defineProps<{
  snowboards: Snowboard[]
  page: number
  total: number
  limit: number
  searchQuery?: string
  onPrevPage: () => void
  onNextPage: () => void
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
}>()

const columnHelper = createColumnHelper<Snowboard>()
const columns = [
  columnHelper.accessor('title', {
    header: 'Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('brand', {
    header: 'Brand',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('price', {
    header: 'Price',
    cell: (info) => {
      const cents = info.getValue() ?? 0
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
      }).format(cents / 100)
    },
  }),
  columnHelper.accessor('discountPercentage', {
    header: 'Discount',
    cell: (info) => {
      const discount = info.getValue() ?? 0
      return `${discount}%`
    },
  }),
  columnHelper.accessor('stock', {
    header: 'Stock',
    cell: (info) => {
      const stock = info.getValue() ?? 0
      return stock
    },
  }),
  columnHelper.accessor('gender', {
    header: 'Gender',
    cell: (info) => info.getValue() ?? 'unisex',
  }),
  columnHelper.accessor('style', {
    header: 'Style',
    cell: (info) => {
      const styles = info.getValue() ?? []
      return h(
        'div',
        { class: 'flex flex-wrap gap-1' },
        styles.map((s) =>
          h(Badge, { class: `capitalize ${getStyleBadgeClass(s)}` }, () => formatStyleLabel(s))
        )
      )
    },
  }),
]

const table = useVueTable({
  get data() {
    return props.snowboards
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-end">
      <div class="relative w-72">
        <Search
          class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
          aria-hidden
        />
        <Input
          :model-value="props.searchQuery ?? ''"
          type="search"
          placeholder="Search by name, brand..."
          class="h-9 w-full pl-9"
          @update:model-value="emit('update:searchQuery', $event)"
        />
      </div>
    </div>
    <div class="min-h-[440px]">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :colspan="header.colSpan"
              :class="{
                'w-[240px]': header.column.id === 'title',
                'text-right': ['price', 'discountPercentage', 'stock'].includes(header.column.id),
                'pl-6': ['discountPercentage', 'gender'].includes(header.column.id),
                capitalize: header.column.id === 'gender',
              }"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
            <TableCell
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="{
                'w-[240px]': cell.column.id === 'title',
                'text-right': ['price', 'discountPercentage', 'stock'].includes(cell.column.id),
                'pl-6': ['discountPercentage', 'gender'].includes(cell.column.id),
                capitalize: cell.column.id === 'gender',
              }"
            >
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <div class="mt-4 flex items-center justify-between">
      <button
        type="button"
        class="rounded border px-4 py-2 disabled:opacity-50"
        :disabled="props.page === 0"
        @click="props.onPrevPage"
      >
        Previous
      </button>
      <span class="text-sm text-muted-foreground">
        Page {{ props.page + 1 }} of {{ Math.max(1, Math.ceil(props.total / props.limit)) }}
      </span>
      <button
        type="button"
        class="rounded border px-4 py-2 disabled:opacity-50"
        :disabled="(props.page + 1) * props.limit >= props.total"
        @click="props.onNextPage"
      >
        Next
      </button>
    </div>
  </div>
</template>

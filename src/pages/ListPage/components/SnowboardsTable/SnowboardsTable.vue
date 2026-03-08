<script setup lang="ts">
import { h, ref } from 'vue'
import { FlexRender, createColumnHelper, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import type { Snowboard } from '@/types/snowboard'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PackageSearch, Search } from 'lucide-vue-next'
import CategoryFilters from '../CategoryFilters/CategoryFilters.vue'
import DetailSidepanel from '../DetailsSidepanel/DetailSidepanel.vue'
import type { Gender, Style } from '@/types/snowboard'
import { formatPrice, formatStyleLabel, getStyleBadgeClass } from '@/lib/utils'

const sheetOpen = ref(false)
const selectedSnowboard = ref<Snowboard | null>(null)

function openRowDetail(snowboard: Snowboard) {
  selectedSnowboard.value = snowboard
  sheetOpen.value = true
}

const props = defineProps<{
  snowboards: Snowboard[]
  page: number
  total: number
  limit: number
  searchQuery?: string
  gender?: Gender | ''
  styles?: Style[]
  onPrevPage: () => void
  onNextPage: () => void
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:gender': [value: Gender | '']
  'update:styles': [value: Style[]]
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
    cell: (info) => formatPrice(info.getValue() ?? 0),
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
    <div class="flex flex-wrap items-center justify-between gap-4">
      <CategoryFilters
        :gender="props.gender ?? ''"
        :styles="props.styles ?? []"
        @update:gender="emit('update:gender', $event)"
        @update:styles="emit('update:styles', $event)"
      />
      <div class="relative w-64 shrink-0">
        <Search
          class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
          aria-hidden
        />
        <Input
          :model-value="props.searchQuery ?? ''"
          type="search"
          placeholder="Search by name, brand..."
          class="h-9 w-full pl-9"
          @update:model-value="emit('update:searchQuery', String($event))"
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
          <TableEmpty v-if="props.snowboards.length === 0" :colspan="7">
            <div class="flex flex-col items-center gap-3">
              <PackageSearch class="size-10 text-muted-foreground" aria-hidden />
              <p class="text-base text-muted-foreground">
                {{
                  props.searchQuery?.trim()
                    ? 'No snowboards match your search.'
                    : 'No snowboards found.'
                }}
              </p>
            </div>
          </TableEmpty>
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="cursor-pointer"
            @click="openRowDetail(row.original)"
          >
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
        Page {{ props.page + 1 }} of {{ Math.max(1, Math.ceil(props.total / props.limit)) }} ({{
          props.total
        }}
        items)
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

    <DetailSidepanel v-model:open="sheetOpen" :selected-snowboard="selectedSnowboard" />
  </div>
</template>

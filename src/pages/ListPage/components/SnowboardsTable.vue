<script setup lang="ts">
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

const props = defineProps<{
  snowboards: Snowboard[]
}>()

const columnHelper = createColumnHelper<Snowboard>()
const columns = [
  columnHelper.accessor('title', {
    header: 'Title',
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
    cell: (info) => {
      const gender = info.getValue() ?? 'unisex'
      return gender
    },
  }),
  columnHelper.accessor('style', {
    header: 'Style',
    cell: (info) => {
      const style = info.getValue() ?? []
      return style.join(', ')
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
  <Table>
    <TableHeader>
      <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
        <TableHead
          v-for="header in headerGroup.headers"
          :key="header.id"
          :colspan="header.colSpan"
          :class="{ 'text-right': ['price'].includes(header.column.id) }"
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
          :class="{ 'text-right': ['price'].includes(cell.column.id) }"
        >
          <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

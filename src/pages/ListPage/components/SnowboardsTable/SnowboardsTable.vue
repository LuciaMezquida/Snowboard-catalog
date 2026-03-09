<script setup lang="ts">
import { h, ref, watch, toRefs } from 'vue'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PackageSearch, Pencil, Plus, Search, Trash2 } from 'lucide-vue-next'
import CategoryFilters from '../CategoryFilters/CategoryFilters.vue'
import DeleteConfirmationModal from '../DeleteConfirmationModal/DeleteConfirmationModal.vue'
import DetailSidepanel from '../DetailsSidepanel/DetailSidepanel.vue'
import ProductFormDialog from '../ProductFormDialog/ProductFormDialog.vue'
import type { Gender, Style } from '@/types/snowboard'
import { getStyleBadgeClass } from '@/lib/styleUtils'
import { formatPrice, formatStyleLabel } from '@/lib/formatters'

const sheetOpen = ref(false)
const selectedSnowboard = ref<Snowboard | null>(null)
const deleteDialogOpen = ref(false)
const snowboardToDelete = ref<Snowboard | null>(null)
const formDialogOpen = ref(false)
const snowboardToEdit = ref<Snowboard | null>(null)

function openRowDetail(snowboard: Snowboard) {
  selectedSnowboard.value = snowboard
  sheetOpen.value = true
}

function openDeleteDialog(snowboard: Snowboard) {
  snowboardToDelete.value = snowboard
  deleteDialogOpen.value = true
}

async function confirmDelete() {
  const snowboard = snowboardToDelete.value
  if (snowboard && props.onDelete) {
    try {
      await props.onDelete(snowboard.id)
      if (selectedSnowboard.value?.id === snowboard.id) {
        sheetOpen.value = false
        selectedSnowboard.value = null
      }
    } finally {
      deleteDialogOpen.value = false
      snowboardToDelete.value = null
    }
  }
}

function cancelDelete() {
  snowboardToDelete.value = null
}

function openCreateDialog() {
  snowboardToEdit.value = null
  formDialogOpen.value = true
}

function openEditDialog(snowboard: Snowboard) {
  snowboardToEdit.value = snowboard
  formDialogOpen.value = true
}

function handleFormChanges(snowboard: Snowboard) {
  if (selectedSnowboard.value?.id === snowboard.id) {
    selectedSnowboard.value = snowboard
  }
}

watch(deleteDialogOpen, (open) => {
  if (!open) snowboardToDelete.value = null
})

watch(formDialogOpen, (open) => {
  if (!open) snowboardToEdit.value = null
})

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
  onDelete?: (id: number) => void | Promise<void>
}>()

const { snowboards: snowboardsRef } = toRefs(props)

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
        styles.map((style) =>
          h(Badge, { class: `whitespace-nowrap capitalize ${getStyleBadgeClass(style)}` }, () =>
            formatStyleLabel(style)
          )
        )
      )
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: (info) => {
      const snowboard = info.row.original
      const title = snowboard.title
      return h(
        'div',
        {
          class: 'flex items-center gap-2',
          onClick: (e) => e.stopPropagation(),
        },
        [
          h(
            'button',
            {
              type: 'button',
              class:
                'rounded-full p-2.5 text-muted-foreground text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400',
              'aria-label': `Delete ${title}`,
              title: `Delete ${title}`,
              onClick: (e) => {
                e.stopPropagation()
                openDeleteDialog(snowboard)
              },
            },
            [h(Trash2, { class: 'size-4' })]
          ),
          h(
            'button',
            {
              type: 'button',
              class:
                'rounded-full p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground',
              'aria-label': `Edit ${title}`,
              title: `Edit ${title}`,
              onClick: (e) => {
                e.stopPropagation()
                openEditDialog(snowboard)
              },
            },
            [h(Pencil, { class: 'size-4' })]
          ),
        ]
      )
    },
  }),
]

const table = useVueTable({
  data: snowboardsRef,
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
      <div class="flex items-center gap-2 shrink-0">
        <div class="relative w-64">
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
        <Button size="sm" @click="openCreateDialog">
          <Plus class="size-4 shrink-0" aria-hidden />
          Add
        </Button>
      </div>
    </div>
    <div class="h-[560px]">
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
                'w-24': header.column.id === 'actions',
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
          <TableEmpty v-if="props.snowboards.length === 0" :colspan="8">
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
                'w-24': cell.column.id === 'actions',
              }"
            >
              <div v-if="cell.column.id === 'actions'" class="contents" @click.stop>
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </div>
              <FlexRender v-else :render="cell.column.columnDef.cell" :props="cell.getContext()" />
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
        {{
          props.total === 0
            ? '0 of 0'
            : `${props.page * props.limit + 1}-${Math.min((props.page + 1) * props.limit, props.total)} of ${props.total}`
        }}
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

    <DeleteConfirmationModal
      v-model:open="deleteDialogOpen"
      :snowboard="snowboardToDelete"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <ProductFormDialog
      v-model:open="formDialogOpen"
      :snowboard="snowboardToEdit"
      @saved="handleFormChanges"
    />
  </div>
</template>

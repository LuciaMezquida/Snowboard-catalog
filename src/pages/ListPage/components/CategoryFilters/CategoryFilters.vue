<script setup lang="ts">
import type { Gender, Style } from '@/types/snowboard'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown, Square, SquareCheck } from 'lucide-vue-next'
import { GENDER_OPTIONS, STYLE_OPTIONS } from '@/lib/constants'
import { formatStyleLabel } from '@/lib/formatters'

const props = defineProps<{
  gender: Gender | ''
  styles: Style[]
}>()

const emit = defineEmits<{
  'update:gender': [value: Gender | '']
  'update:styles': [value: Style[]]
}>()

const genderLabel = () => {
  const options = GENDER_OPTIONS.find((option) => option.value === props.gender)
  return options?.label ?? 'By gender'
}

const styleLabel = () => {
  if (props.styles.length === 0) return 'By style'
  return props.styles
    .map(
      (style) =>
        STYLE_OPTIONS.find((option) => option.value === style)?.label ?? formatStyleLabel(style)
    )
    .join(', ')
}

function onGenderChange(value: unknown) {
  emit('update:gender', (value as Gender | '') ?? '')
}

function toggleStyle(selectedStyle: Style, event: { preventDefault?: () => void }) {
  event?.preventDefault?.()
  const selectedStyleIsChecked = props.styles.includes(selectedStyle)
  const updatedStyles = selectedStyleIsChecked
    ? props.styles.filter((style) => style !== selectedStyle)
    : [...props.styles, selectedStyle]
  emit('update:styles', updatedStyles)
}

function clearAllFilters() {
  emit('update:gender', '')
  emit('update:styles', [])
}
</script>

<template>
  <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
    <span class="text-sm font-medium text-muted-foreground">Category</span>
    <div class="flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm" class="w-[130px] justify-between gap-2">
            {{ genderLabel() }}
            <ChevronDown class="size-4 shrink-0 opacity-50" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-[130px]">
          <DropdownMenuRadioGroup
            :model-value="props.gender"
            @update:model-value="onGenderChange($event)"
          >
            <DropdownMenuRadioItem
              v-for="opt in GENDER_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            class="justify-center text-center text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/30 dark:focus:text-red-300"
            @select="emit('update:gender', '')"
          >
            Clear filter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="sm" class="min-w-[130px] justify-between gap-2">
            {{ styleLabel() }}
            <ChevronDown class="size-4 shrink-0 opacity-50" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-[130px]">
          <DropdownMenuItem
            v-for="opt in STYLE_OPTIONS"
            :key="opt.value"
            class="gap-2 pl-8"
            @select="toggleStyle(opt.value, $event)"
          >
            <span class="absolute left-2 flex size-4 items-center justify-center">
              <SquareCheck
                v-if="props.styles.includes(opt.value)"
                class="size-4 shrink-0"
                aria-hidden
              />
              <Square v-else class="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </span>
            {{ opt.label }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            class="justify-center text-center text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-950/30 dark:focus:text-red-300"
            @select="emit('update:styles', [])"
          >
            Clear filter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        v-if="props.styles.length > 0 || props.gender"
        variant="outline"
        size="xs"
        class="shrink-0 rounded-full border-red-200 px-2.5 py-0.5 text-xs text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:border-red-800 dark:hover:bg-red-950/30 dark:hover:text-red-300"
        @click="clearAllFilters"
      >
        Clear all filters
      </Button>
    </div>
  </div>
</template>

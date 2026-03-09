<script setup lang="ts">
import type { Snowboard } from '@/types/snowboard'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { getStyleBadgeClass } from '@/lib/styleUtils'
import { formatPrice, formatStyleLabel } from '@/lib/formatters'

defineProps<{
  open: boolean
  selectedSnowboard: Snowboard | null
}>()

defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent side="right" class="w-full sm:max-w-xl">
      <SheetHeader>
        <SheetTitle class="text-2xl">{{
          selectedSnowboard?.title ?? 'Snowboard details'
        }}</SheetTitle>
        <SheetDescription v-if="selectedSnowboard?.description" class="text-left text-base">
          {{ selectedSnowboard.description }}
        </SheetDescription>
      </SheetHeader>
      <div v-if="selectedSnowboard" class="mt-6 grid gap-6 sm:grid-cols-2">
        <dl class="space-y-3 mt-6">
          <div>
            <dt class="text-base font-medium text-muted-foreground">Brand</dt>
            <dd class="mt-0.5">{{ selectedSnowboard.brand }}</dd>
          </div>
          <div class="pt-4">
            <dt class="text-base font-medium text-muted-foreground">Shape</dt>
            <dd class="mt-0.5 capitalize">{{ selectedSnowboard.shape }}</dd>
          </div>
          <div class="pt-4">
            <dt class="text-base font-medium text-muted-foreground">Stiffness</dt>
            <dd class="mt-0.5">{{ selectedSnowboard.stiffness }}</dd>
          </div>
          <div class="pt-4">
            <dt class="text-base font-medium text-muted-foreground">Gender</dt>
            <dd class="mt-0.5 capitalize">{{ selectedSnowboard.gender ?? 'unisex' }}</dd>
          </div>
          <div v-if="selectedSnowboard.style?.length" class="pt-4">
            <dt class="text-base font-medium text-muted-foreground">Style</dt>
            <dd class="mt-1 flex flex-wrap gap-1">
              <Badge
                v-for="style in selectedSnowboard.style"
                :key="style"
                :class="getStyleBadgeClass(style)"
                class="whitespace-nowrap capitalize"
              >
                {{ formatStyleLabel(style) }}
              </Badge>
            </dd>
          </div>
        </dl>
        <dl class="space-y-3 mt-6">
          <div>
            <dt class="text-base font-medium text-muted-foreground">Price</dt>
            <dd class="mt-0.5">{{ formatPrice(selectedSnowboard.price) }}</dd>
          </div>
          <div class="pt-4">
            <dt class="text-base font-medium text-muted-foreground">Discount</dt>
            <dd class="mt-0.5">{{ selectedSnowboard.discountPercentage }}%</dd>
          </div>
          <div class="pt-4">
            <dt class="text-base font-medium text-muted-foreground">Stock</dt>
            <dd class="mt-0.5">{{ selectedSnowboard.stock }}</dd>
          </div>
          <div v-if="selectedSnowboard.sizes?.length" class="pt-4">
            <dt class="text-base font-medium text-muted-foreground">Sizes</dt>
            <dd class="mt-0.5">{{ selectedSnowboard.sizes.join(', ') }}</dd>
          </div>
        </dl>
      </div>
    </SheetContent>
  </Sheet>
</template>

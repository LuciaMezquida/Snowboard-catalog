<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSnowboardsStore } from '@/stores/snowboards'
import type { Snowboard } from '@/types/snowboard'
import type { Gender, Style } from '@/types/snowboard'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Square, SquareCheck } from 'lucide-vue-next'
import { GENDER_OPTIONS, STYLE_OPTIONS } from '@/lib/constants'
import { isValidNumber } from '@/lib/validators'
import { formatStyleLabel } from '@/lib/formatters'

const store = useSnowboardsStore()

const props = defineProps<{
  open: boolean
  snowboard: Snowboard | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: [snowboard: Snowboard]
}>()

const isEditMode = computed(() => props.snowboard !== null)

const dialogTitle = computed(() =>
  isEditMode.value ? `Edit ${props.snowboard?.title ?? ''}` : 'Add a new product'
)

const form = ref({
  title: '',
  description: '',
  shape: '',
  price: 0,
  discountPercentage: 0,
  brand: '',
  stock: 0,
  style: [] as Style[],
  gender: 'unisex' as Gender,
  sizes: '' as string,
  stiffness: 1,
})

function resetForm() {
  form.value = {
    title: '',
    description: '',
    shape: '',
    price: 0,
    discountPercentage: 0,
    brand: '',
    stock: 0,
    style: [],
    gender: 'unisex',
    sizes: '',
    stiffness: 1,
  }
}

function fillForm(snowboard: Snowboard) {
  form.value = {
    title: snowboard.title,
    description: snowboard.description,
    shape: snowboard.shape,
    price: snowboard.price / 100,
    discountPercentage: snowboard.discountPercentage,
    brand: snowboard.brand,
    stock: snowboard.stock,
    style: [...(snowboard.style ?? [])],
    gender: snowboard.gender ?? 'unisex',
    sizes: (snowboard.sizes ?? []).join(', '),
    stiffness: Math.max(1, Math.min(10, snowboard.stiffness ?? 1)),
  }
}

const editingId = ref<number | null>(null)

watch(
  () => [props.open, props.snowboard] as const,
  ([open, snowboard]) => {
    if (open) {
      if (snowboard) {
        editingId.value = snowboard.id
        fillForm(snowboard)
      } else {
        editingId.value = null
        resetForm()
      }
    } else {
      editingId.value = null
    }
  }
)

const genderLabel = computed(() => {
  const genderOption = GENDER_OPTIONS.find((option) => option.value === form.value.gender)
  return genderOption?.label ?? 'Unisex'
})

const isFormValid = computed(() => {
  const f = form.value
  if (!f.title.trim()) return false
  if (!f.brand.trim()) return false
  if (!f.shape.trim()) return false
  if (!isValidNumber(f.price, 0)) return false
  if (!isValidNumber(f.discountPercentage, 0, 100)) return false
  if (!isValidNumber(f.stock, 0)) return false
  if (f.style.length === 0) return false
  if (parseSizes(f.sizes).length === 0 || sizesError.value) return false
  if (!isValidNumber(f.stiffness, 1, 10) || stiffnessError.value) return false
  return true
})

function toggleStyle(style: Style) {
  const idx = form.value.style.indexOf(style)
  if (idx >= 0) form.value.style = form.value.style.filter((s) => s !== style)
  else form.value.style = [...form.value.style, style]
}

/** Valid size: digits optionally followed by a single 'w' or 'W' (e.g. 147, 147w, 147W) */
const VALID_SIZE_PATTERN = /^\d+[wW]?$/

function parseSizes(str: string): number[] {
  return str
    .split(',')
    .map((s) => s.trim().replace(/[wW]$/, ''))
    .filter((s) => s.length > 0)
    .map((s) => parseInt(s, 10))
    .filter((n) => !Number.isNaN(n))
}

const sizesError = computed(() => {
  const sizes = form.value.sizes.trim()
  if (!sizes) return null
  if (/\d+\s+\d/.test(sizes) && !sizes.includes(',')) {
    return 'Use comma-separated values (e.g. 150, 154, 158)'
  }
  if (/,,/.test(sizes)) {
    return 'Use a single comma between values (e.g. 150, 154, 158)'
  }
  const sizesItems = sizes.split(',').map((item) => item.trim())
  const hasEmptyEntry = sizesItems.some((item) => item === '')
  if (hasEmptyEntry) {
    return 'Remove empty entries between commas (e.g. 150, 154, 158)'
  }
  const hasInvalidItem = sizesItems.some((p) => !VALID_SIZE_PATTERN.test(p))
  if (hasInvalidItem) {
    return 'Each value must be a number, optionally followed by "w" or "W" (e.g. 150, 154w, 154W)'
  }
  return null
})

const stiffnessError = computed(() => {
  const val = form.value.stiffness
  if (typeof val !== 'number' || Number.isNaN(val)) {
    return 'Stiffness must be a number between 1 and 10'
  }
  if (val < 1 || val > 10) {
    return 'Stiffness must be between 1 and 10'
  }
  return null
})

function buildPayload() {
  const sizes = parseSizes(form.value.sizes)
  return {
    title: form.value.title,
    description: form.value.description,
    shape: form.value.shape,
    price: Math.round(form.value.price * 100),
    discountPercentage: form.value.discountPercentage,
    brand: form.value.brand,
    stock: form.value.stock,
    style: form.value.style,
    gender: form.value.gender,
    sizes,
    stiffness: form.value.stiffness,
  }
}

async function handleSaveClick() {
  if (!isFormValid.value) return
  const payload = buildPayload()
  const id = editingId.value
  if (id !== null) {
    const updated = await store.updateSnowboard(id, payload)
    emit('saved', updated)
  } else {
    await store.createSnowboard(payload)
  }
  emit('update:open', false)
}

function handleSubmit(e: { preventDefault: () => void }) {
  e.preventDefault()
  handleSaveClick()
}

function handleCancel() {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg" @open-auto-focus.prevent>
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
      </DialogHeader>
      <form class="grid gap-4 py-4" @submit="handleSubmit">
        <div class="grid gap-2">
          <Label for="title">Title <span class="text-destructive">*</span></Label>
          <Input id="title" v-model="form.title" required placeholder="Product name" />
        </div>
        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Input id="description" v-model="form.description" placeholder="Product description" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="brand">Brand <span class="text-destructive">*</span></Label>
            <Input id="brand" v-model="form.brand" required placeholder="Brand" />
          </div>
          <div class="grid gap-2">
            <Label for="shape">Shape <span class="text-destructive">*</span></Label>
            <Input id="shape" v-model="form.shape" required placeholder="e.g. Directional" />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="grid gap-2">
            <Label for="price">Price <span class="text-destructive">*</span></Label>
            <Input
              id="price"
              v-model.number="form.price"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="0"
            />
          </div>
          <div class="grid gap-2">
            <Label for="discount">Discount % <span class="text-destructive">*</span></Label>
            <Input
              id="discount"
              v-model.number="form.discountPercentage"
              type="number"
              min="0"
              max="100"
              required
              placeholder="0"
            />
          </div>
          <div class="grid gap-2">
            <Label for="stock">Stock <span class="text-destructive">*</span></Label>
            <Input
              id="stock"
              v-model.number="form.stock"
              type="number"
              min="0"
              required
              placeholder="0"
            />
          </div>
        </div>
        <div class="grid gap-2">
          <Label>Gender</Label>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" class="w-full justify-between">
                {{ genderLabel }}
                <ChevronDown class="size-4 shrink-0 opacity-50" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-[var(--radix-dropdown-menu-trigger-width)]">
              <DropdownMenuRadioGroup
                :model-value="form.gender"
                @update:model-value="form.gender = $event as Gender"
              >
                <DropdownMenuRadioItem
                  v-for="opt in GENDER_OPTIONS"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div class="grid gap-2">
          <Label>Style <span class="text-destructive">*</span></Label>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" class="w-full justify-between">
                {{
                  form.style.length
                    ? form.style
                        .map(
                          (s) =>
                            STYLE_OPTIONS.find((o) => o.value === s)?.label ?? formatStyleLabel(s)
                        )
                        .join(', ')
                    : 'Select styles'
                }}
                <ChevronDown class="size-4 shrink-0 opacity-50" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-[var(--radix-dropdown-menu-trigger-width)]">
              <button
                v-for="opt in STYLE_OPTIONS"
                :key="opt.value"
                type="button"
                class="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                @click="toggleStyle(opt.value)"
              >
                <span class="absolute left-2 flex size-4 items-center justify-center">
                  <SquareCheck
                    v-if="form.style.includes(opt.value)"
                    class="size-4 shrink-0"
                    aria-hidden
                  />
                  <Square v-else class="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </span>
                {{ opt.label }}
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="sizes">
              Sizes (comma-separated) <span class="text-destructive">*</span>
            </Label>
            <Input id="sizes" v-model="form.sizes" required placeholder="150, 154, 158" />
            <p class="min-h-5 text-xs text-destructive" :class="{ invisible: !sizesError }">
              {{ sizesError || '\u00A0' }}
            </p>
          </div>
          <div class="grid gap-2">
            <Label for="stiffness">Stiffness <span class="text-destructive">*</span></Label>
            <Input
              id="stiffness"
              v-model.number="form.stiffness"
              type="number"
              min="1"
              max="10"
              required
              placeholder="1"
            />
            <p class="min-h-5 text-xs text-destructive" :class="{ invisible: !stiffnessError }">
              {{ stiffnessError || '\u00A0' }}
            </p>
          </div>
        </div>
        <DialogFooter class="gap-2 sm:gap-2">
          <Button type="button" variant="outline" @click="handleCancel">Cancel</Button>
          <Button type="submit" :disabled="!isFormValid">
            {{ isEditMode ? 'Save' : 'Create' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

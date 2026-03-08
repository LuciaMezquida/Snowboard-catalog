<script setup lang="ts">
import type { Snowboard } from '@/types/snowboard'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

defineProps<{
  open: boolean
  snowboard: Snowboard | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md" @open-auto-focus.prevent>
      <DialogHeader>
        <DialogTitle>Delete snowboard</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete "{{ snowboard?.title }}"? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="gap-2 sm:gap-2">
        <DialogClose as-child>
          <Button type="button" variant="outline" @click="handleCancel">Cancel</Button>
        </DialogClose>
        <Button type="button" variant="destructive" @click="handleConfirm">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

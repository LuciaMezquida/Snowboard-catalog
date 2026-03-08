<script setup lang="ts">
import type { DialogCloseProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { DialogClose as RekaDialogClose, useForwardProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<DialogCloseProps & { class?: HTMLAttributes['class'] }>()
const delegatedProps = reactiveOmit(props, 'class')
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <RekaDialogClose
    :class="cn('inline-flex items-center justify-center', props.class)"
    v-bind="forwarded"
  >
    <slot />
  </RekaDialogClose>
</template>

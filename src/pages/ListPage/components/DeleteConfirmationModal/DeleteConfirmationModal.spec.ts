import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DeleteConfirmationModal from './DeleteConfirmationModal.vue'
import type { Snowboard } from '@/types/snowboard'

const mockSnowboard: Snowboard = {
  id: 1,
  title: 'Burton Custom X',
  description: 'All-mountain board',
  shape: 'Directional',
  price: 599,
  discountPercentage: 0,
  brand: 'Burton',
  stock: 10,
  style: ['all_mountain'],
  gender: 'unisex',
  sizes: [150, 154, 158],
  stiffness: 7,
}

function createWrapper(props: { open?: boolean; snowboard?: Snowboard | null } = {}) {
  return mount(DeleteConfirmationModal, {
    props: {
      open: props.open ?? true,
      snowboard: props.snowboard ?? mockSnowboard,
      ...props,
    },
    attachTo: globalThis.document?.body,
    global: {
      stubs: {
        Dialog: {
          template: '<div v-if="open"><slot /></div>',
          props: ['open'],
        },
        DialogContent: { template: '<div><slot /></div>' },
        DialogHeader: { template: '<div><slot /></div>' },
        DialogTitle: { template: '<h2><slot /></h2>' },
        DialogDescription: { template: '<p><slot /></p>' },
        DialogFooter: { template: '<div><slot /></div>' },
        DialogClose: { template: '<div><slot /></div>' },
      },
    },
  })
}

describe('DeleteConfirmationModal', () => {
  it('renders title "Delete snowboard"', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Delete snowboard')
  })

  it('shows snowboard title in description when snowboard is provided', () => {
    const wrapper = createWrapper({ snowboard: mockSnowboard })
    expect(wrapper.text()).toContain('Burton Custom X')
    expect(wrapper.text()).toContain('This action cannot be undone')
  })

  it('shows description when snowboard is null', () => {
    const wrapper = createWrapper({ snowboard: null })
    expect(wrapper.text()).toContain('This action cannot be undone')
  })

  it('renders Cancel and Delete buttons', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('Delete')
  })

  it('emits confirm when Delete button is clicked', async () => {
    const wrapper = createWrapper()
    const deleteButton = wrapper.findAll('button').find((btn) => btn.text() === 'Delete')
    expect(deleteButton).toBeDefined()
    await deleteButton!.trigger('click')

    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('emits cancel and update:open false when Cancel button is clicked', async () => {
    const wrapper = createWrapper()
    const cancelButton = wrapper.findAll('button').find((btn) => btn.text() === 'Cancel')
    expect(cancelButton).toBeDefined()
    await cancelButton!.trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })
})

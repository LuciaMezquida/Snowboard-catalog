import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductFormDialog from './ProductFormDialog.vue'
import type { Snowboard } from '@/types/snowboard'

const mockSnowboard: Snowboard = {
  id: 1,
  title: 'Burton Custom X',
  description: 'All-mountain board for versatile riding',
  shape: 'Directional',
  price: 59900,
  discountPercentage: 10,
  brand: 'Burton',
  stock: 15,
  style: ['all_mountain', 'freestyle'],
  gender: 'unisex',
  sizes: [150, 154, 158],
  stiffness: 7,
}

const mockCreateSnowboard = vi.fn()
const mockUpdateSnowboard = vi.fn()

vi.mock('@/stores/snowboards', () => ({
  useSnowboardsStore: () => ({
    createSnowboard: mockCreateSnowboard,
    updateSnowboard: mockUpdateSnowboard,
  }),
}))

function createWrapper(
  props: {
    open?: boolean
    snowboard?: Snowboard | null
  } = {}
) {
  return mount(ProductFormDialog, {
    props: {
      open: props.open ?? true,
      snowboard: props.snowboard ?? null,
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
        DialogFooter: { template: '<div><slot /></div>' },
      },
    },
  })
}

describe('ProductFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('dialog title', () => {
    it('shows "Add a new product" when snowboard is null (create mode)', () => {
      const wrapper = createWrapper({ open: true, snowboard: null })
      expect(wrapper.text()).toContain('Add a new product')
    })

    it('shows "Edit {title}" when snowboard is defined (edit mode)', () => {
      const wrapper = createWrapper({ open: true, snowboard: mockSnowboard })
      expect(wrapper.text()).toContain('Edit Burton Custom X')
    })
  })

  describe('form rendering', () => {
    it('renders required field labels', () => {
      const wrapper = createWrapper({ open: true, snowboard: null })
      expect(wrapper.text()).toContain('Title')
      expect(wrapper.text()).toContain('Description')
      expect(wrapper.text()).toContain('Brand')
      expect(wrapper.text()).toContain('Shape')
      expect(wrapper.text()).toContain('Price')
      expect(wrapper.text()).toContain('Discount')
      expect(wrapper.text()).toContain('Stock')
      expect(wrapper.text()).toContain('Gender')
      expect(wrapper.text()).toContain('Style')
      expect(wrapper.text()).toContain('Sizes')
      expect(wrapper.text()).toContain('Stiffness')
    })

    it('renders Cancel and Create buttons in create mode', () => {
      const wrapper = createWrapper({ open: true, snowboard: null })
      expect(wrapper.text()).toContain('Cancel')
      expect(wrapper.text()).toContain('Create')
    })

    it('renders Cancel and Save buttons in edit mode', () => {
      const wrapper = createWrapper({ open: true, snowboard: mockSnowboard })
      expect(wrapper.text()).toContain('Cancel')
      expect(wrapper.text()).toContain('Save')
    })
  })

  describe('form prefill in edit mode', () => {
    it('prefills form with snowboard data when opened in edit mode', async () => {
      const wrapper = createWrapper({ open: false, snowboard: null })
      await wrapper.setProps({ open: true, snowboard: mockSnowboard } as never)
      await wrapper.vm.$nextTick()

      const titleInput = wrapper.find('#title')
      const brandInput = wrapper.find('#brand')
      const shapeInput = wrapper.find('#shape')
      const priceInput = wrapper.find('#price')
      const sizesInput = wrapper.find('#sizes')

      expect((titleInput.element as HTMLInputElement).value).toBe('Burton Custom X')
      expect((brandInput.element as HTMLInputElement).value).toBe('Burton')
      expect((shapeInput.element as HTMLInputElement).value).toBe('Directional')
      expect((priceInput.element as HTMLInputElement).value).toBe('599')
      expect((sizesInput.element as HTMLInputElement).value).toBe('150, 154, 158')
    })
  })

  describe('Cancel button', () => {
    it('emits update:open false when Cancel is clicked', async () => {
      const wrapper = createWrapper({ open: true, snowboard: null })
      const cancelButton = wrapper.findAll('button').find((btn) => btn.text() === 'Cancel')
      expect(cancelButton).toBeDefined()
      await cancelButton!.trigger('click')

      expect(wrapper.emitted('update:open')).toEqual([[false]])
    })
  })

  describe('form validation', () => {
    it('Create button is disabled when form is empty', () => {
      const wrapper = createWrapper({ open: true, snowboard: null })
      const submitButton = wrapper.findAll('button').find((btn) => btn.text() === 'Create')
      expect(submitButton?.attributes('disabled')).toBeDefined()
    })

    it('Create button is enabled when form is valid', async () => {
      const wrapper = createWrapper({ open: true, snowboard: null })

      await wrapper.find('#title').setValue('Test Board')
      await wrapper.find('#brand').setValue('Test Brand')
      await wrapper.find('#shape').setValue('Directional')
      await wrapper.find('#price').setValue('299')
      await wrapper.find('#discount').setValue('0')
      await wrapper.find('#stock').setValue('10')
      await wrapper.find('#sizes').setValue('150, 154, 158')
      await wrapper.find('#stiffness').setValue('5')

      // Need to select at least one style - done via dropdown. Form requires style.length > 0. Simulate internal state
      const vm = wrapper.vm as unknown as { form: { style: string[] } }
      vm.form.style = ['all_mountain']

      await wrapper.vm.$nextTick()

      const submitButton = wrapper.findAll('button').find((btn) => btn.text() === 'Create')
      expect(submitButton?.attributes('disabled')).toBeUndefined()
    })
  })

  describe('save (create mode)', () => {
    it('calls createSnowboard and emits update:open false when saving a new product', async () => {
      mockCreateSnowboard.mockResolvedValue({ id: -1, title: 'New Board' })

      const wrapper = createWrapper({ open: true, snowboard: null })

      await wrapper.find('#title').setValue('New Board')
      await wrapper.find('#description').setValue('A new board')
      await wrapper.find('#brand').setValue('Brand')
      await wrapper.find('#shape').setValue('Twin')
      await wrapper.find('#price').setValue('399')
      await wrapper.find('#discount').setValue('5')
      await wrapper.find('#stock').setValue('20')
      await wrapper.find('#sizes').setValue('150, 154, 158, 162')
      await wrapper.find('#stiffness').setValue('6')

      const vm = wrapper.vm as unknown as { form: { style: string[] } }
      vm.form.style = ['all_mountain']

      await wrapper.vm.$nextTick()

      const form = wrapper.find('form')
      await form.trigger('submit')

      await wrapper.vm.$nextTick()

      expect(mockCreateSnowboard).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Board',
          brand: 'Brand',
          shape: 'Twin',
          price: 39900,
          discountPercentage: 5,
          stock: 20,
          sizes: [150, 154, 158, 162],
          stiffness: 6,
          style: ['all_mountain'],
        })
      )
      expect(wrapper.emitted('update:open')).toEqual([[false]])
    })
  })

  describe('save (edit mode)', () => {
    it('calls updateSnowboard and emits saved and update:open false when saving edit', async () => {
      const updatedSnowboard: Snowboard = {
        ...mockSnowboard,
        title: 'Burton Custom X Updated',
      }
      mockUpdateSnowboard.mockResolvedValue(updatedSnowboard)

      const wrapper = createWrapper({ open: false, snowboard: null })
      await wrapper.setProps({ open: true, snowboard: mockSnowboard } as never)
      await wrapper.vm.$nextTick()

      await wrapper.find('#title').setValue('Burton Custom X Updated')
      await wrapper.vm.$nextTick()

      const form = wrapper.find('form')
      await form.trigger('submit')

      await wrapper.vm.$nextTick()

      expect(mockUpdateSnowboard).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: 'Burton Custom X Updated',
          brand: 'Burton',
          shape: 'Directional',
        })
      )
      expect(wrapper.emitted('saved')).toEqual([[updatedSnowboard]])
      expect(wrapper.emitted('update:open')).toEqual([[false]])
    })
  })

  describe('sizes validation', () => {
    it('shows error when sizes has spaces without commas', async () => {
      const wrapper = createWrapper({ open: true, snowboard: null })
      await wrapper.find('#sizes').setValue('150 154 158')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Use comma-separated values')
    })

    it('shows error when sizes has double commas', async () => {
      const wrapper = createWrapper({ open: true, snowboard: null })
      await wrapper.find('#sizes').setValue('150,,154')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Use a single comma between values')
    })

    it('shows error when sizes has empty entries between commas', async () => {
      const wrapper = createWrapper({ open: true, snowboard: null })
      await wrapper.find('#sizes').setValue('133, , 133')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Remove empty entries between commas')
    })

    it('shows error when sizes contains invalid letters (only "w" after number is allowed)', async () => {
      const wrapper = createWrapper({ open: true, snowboard: null })
      await wrapper.find('#sizes').setValue('147d, ffd99')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Each value must be a number')
    })

    it('shows error when stiffness is out of range (1-10)', async () => {
      const wrapper = createWrapper({ open: true, snowboard: null })
      await wrapper.find('#stiffness').setValue('99')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Stiffness must be between 1 and 10')
    })

    it('accepts sizes with optional "w" or "W" suffix', async () => {
      const wrapper = createWrapper({ open: true, snowboard: null })
      await wrapper.find('#sizes').setValue('147, 154w, 158W')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).not.toContain('Each value must be a number')
      expect(wrapper.text()).not.toContain('Remove empty entries')
    })
  })
})

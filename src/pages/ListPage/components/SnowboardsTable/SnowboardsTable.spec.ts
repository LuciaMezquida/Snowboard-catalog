import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SnowboardsTable from './SnowboardsTable.vue'
import CategoryFilters from '../CategoryFilters/CategoryFilters.vue'
import DetailSidepanel from '../DetailsSidepanel/DetailSidepanel.vue'
import DeleteConfirmationModal from '../DeleteConfirmationModal/DeleteConfirmationModal.vue'
import ProductFormDialog from '../ProductFormDialog/ProductFormDialog.vue'
import type { Snowboard } from '@/types/snowboard'

const mockSnowboards: Snowboard[] = [
  {
    id: 1,
    title: 'Burton Custom X',
    description: 'All-mountain board',
    shape: 'Directional',
    price: 59900,
    discountPercentage: 10,
    brand: 'Burton',
    stock: 15,
    style: ['all_mountain', 'freestyle'],
    gender: 'unisex',
    sizes: [150, 154, 158],
    stiffness: 7,
  },
  {
    id: 2,
    title: 'Jones Frontier',
    description: 'Freeride board',
    shape: 'Twin',
    price: 44900,
    discountPercentage: 0,
    brand: 'Jones',
    stock: 8,
    style: ['freeride'],
    gender: 'male',
    sizes: [156, 160],
    stiffness: 6,
  },
]

const defaultProps = {
  snowboards: mockSnowboards,
  page: 0,
  total: 2,
  limit: 10,
  onPrevPage: vi.fn(),
  onNextPage: vi.fn(),
}

function createWrapper(props: Record<string, unknown> = {}) {
  return mount(SnowboardsTable, {
    props: {
      ...defaultProps,
      ...props,
    },
    attachTo: globalThis.document?.body,
    global: {
      stubs: {
        DetailSidepanel: {
          template: '<div v-if="open"><slot /></div>',
          props: ['open', 'selectedSnowboard'],
        },
        DeleteConfirmationModal: {
          template: '<div v-if="open"><slot /></div>',
          props: ['open', 'snowboard'],
        },
        ProductFormDialog: {
          template: '<div v-if="open"><slot /></div>',
          props: ['open', 'snowboard'],
        },
        CategoryFilters: {
          template: '<div data-testid="category-filters"><slot /></div>',
          props: ['gender', 'styles'],
        },
      },
    },
  })
}

describe('SnowboardsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('table headers', () => {
    it('renders column headers', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Name')
      expect(wrapper.text()).toContain('Brand')
      expect(wrapper.text()).toContain('Price')
      expect(wrapper.text()).toContain('Discount')
      expect(wrapper.text()).toContain('Stock')
      expect(wrapper.text()).toContain('Gender')
      expect(wrapper.text()).toContain('Style')
    })
  })

  describe('table rows', () => {
    it('renders snowboard rows with data', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Burton Custom X')
      expect(wrapper.text()).toContain('Jones Frontier')
      expect(wrapper.text()).toContain('Burton')
      expect(wrapper.text()).toContain('Jones')
      expect(wrapper.text()).toContain('€599.00')
      expect(wrapper.text()).toContain('€449.00')
      expect(wrapper.text()).toContain('10%')
      expect(wrapper.text()).toContain('15')
      expect(wrapper.text()).toContain('8')
      expect(wrapper.text()).toContain('unisex')
      expect(wrapper.text()).toContain('male')
    })

    it('renders style badges', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('all mountain')
      expect(wrapper.text()).toContain('freestyle')
      expect(wrapper.text()).toContain('freeride')
    })
  })

  describe('empty state', () => {
    it('shows "No snowboards found." when snowboards is empty and no search', () => {
      const wrapper = createWrapper({ snowboards: [], total: 0 })
      expect(wrapper.text()).toContain('No snowboards found.')
    })

    it('shows "No snowboards match your search." when snowboards is empty and searchQuery has value', () => {
      const wrapper = createWrapper({
        snowboards: [],
        total: 0,
        searchQuery: 'test',
      })
      expect(wrapper.text()).toContain('No snowboards match your search.')
    })
  })

  describe('search', () => {
    it('renders search input with placeholder', () => {
      const wrapper = createWrapper()
      const input = wrapper.find('input[type="search"]')
      expect(input.exists()).toBe(true)
      expect(input.attributes('placeholder')).toBe('Search by name, brand...')
    })

    it('emits update:searchQuery when search input changes', async () => {
      const wrapper = createWrapper()
      const input = wrapper.find('input[type="search"]')
      await input.setValue('Burton')
      expect(wrapper.emitted('update:searchQuery')).toEqual([['Burton']])
    })

    it('shows searchQuery value in input', () => {
      const wrapper = createWrapper({ searchQuery: 'Jones' })
      const input = wrapper.find('input[type="search"]')
      expect((input.element as unknown as { value: string }).value).toBe('Jones')
    })
  })

  describe('Add button', () => {
    it('renders Add button', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Add')
    })

    it('opens create dialog when Add is clicked', async () => {
      const wrapper = createWrapper()
      const addButton = wrapper.findAll('button').find((btn) => btn.text()?.includes('Add'))
      expect(addButton).toBeDefined()
      await addButton!.trigger('click')
      const formDialog = wrapper.findComponent(ProductFormDialog)
      const formProps = formDialog.props() as { open: boolean; snowboard: Snowboard | null }
      expect(formProps.open).toBe(true)
      expect(formProps.snowboard).toBeNull()
    })
  })

  describe('row actions', () => {
    it('opens detail sidepanel when row is clicked', async () => {
      const wrapper = createWrapper()
      const rows = wrapper.findAll('[class*="cursor-pointer"]')
      expect(rows.length).toBeGreaterThan(0)
      await rows[0]!.trigger('click')
      const sidepanel = wrapper.findComponent(DetailSidepanel)
      const sidepanelProps = sidepanel.props() as { selectedSnowboard: Snowboard | null }
      expect(sidepanelProps.selectedSnowboard?.id).toBe(1)
    })

    it('opens delete dialog when Delete button is clicked', async () => {
      const wrapper = createWrapper()
      const deleteButton = wrapper.find('button[aria-label="Delete Burton Custom X"]')
      expect(deleteButton.exists()).toBe(true)
      await deleteButton.trigger('click')
      const modal = wrapper.findComponent(DeleteConfirmationModal)
      const modalProps = modal.props() as { open: boolean; snowboard: Snowboard | null }
      expect(modalProps.open).toBe(true)
      expect(modalProps.snowboard?.title).toBe('Burton Custom X')
    })

    it('opens edit dialog when Edit button is clicked', async () => {
      const wrapper = createWrapper()
      const editButton = wrapper.find('button[aria-label="Edit Burton Custom X"]')
      expect(editButton.exists()).toBe(true)
      await editButton.trigger('click')
      const formDialog = wrapper.findComponent(ProductFormDialog)
      const formProps = formDialog.props() as { open: boolean; snowboard: Snowboard | null }
      expect(formProps.open).toBe(true)
      expect(formProps.snowboard?.title).toBe('Burton Custom X')
    })
  })

  describe('pagination', () => {
    it('renders Previous and Next buttons', () => {
      const wrapper = createWrapper()
      expect(wrapper.text()).toContain('Previous')
      expect(wrapper.text()).toContain('Next')
    })

    it('shows page range when total > 0', () => {
      const wrapper = createWrapper({ page: 0, total: 25, limit: 10 })
      expect(wrapper.text()).toContain('1-10 of 25')
    })

    it('shows "0 of 0" when total is 0', () => {
      const wrapper = createWrapper({ snowboards: [], total: 0 })
      expect(wrapper.text()).toContain('0 of 0')
    })

    it('disables Previous when page is 0', () => {
      const wrapper = createWrapper({ page: 0 })
      const prevButton = wrapper.findAll('button').find((btn) => btn.text() === 'Previous')
      expect(prevButton?.attributes('disabled')).toBeDefined()
    })

    it('disables Next when on last page', () => {
      const wrapper = createWrapper({ page: 1, total: 15, limit: 10 })
      const nextButton = wrapper.findAll('button').find((btn) => btn.text() === 'Next')
      expect(nextButton?.attributes('disabled')).toBeDefined()
    })

    it('calls onPrevPage when Previous is clicked', async () => {
      const onPrevPage = vi.fn()
      const wrapper = createWrapper({ page: 1, onPrevPage })
      const prevButton = wrapper.findAll('button').find((btn) => btn.text() === 'Previous')
      await prevButton!.trigger('click')
      expect(onPrevPage).toHaveBeenCalledTimes(1)
    })

    it('calls onNextPage when Next is clicked', async () => {
      const onNextPage = vi.fn()
      const wrapper = createWrapper({ onNextPage, total: 25, limit: 10 })
      const nextButton = wrapper.findAll('button').find((btn) => btn.text()?.trim() === 'Next')
      expect(nextButton).toBeDefined()
      await nextButton!.trigger('click')
      expect(onNextPage).toHaveBeenCalledTimes(1)
    })
  })

  describe('CategoryFilters', () => {
    it('passes gender and styles to CategoryFilters', () => {
      const wrapper = createWrapper({ gender: 'male', styles: ['freestyle'] })
      const filters = wrapper.findComponent(CategoryFilters)
      const filterProps = filters.props() as { gender: string; styles: string[] }
      expect(filterProps.gender).toBe('male')
      expect(filterProps.styles).toEqual(['freestyle'])
    })

    it('emits update:gender when CategoryFilters emits', async () => {
      const wrapper = createWrapper()
      const filters = wrapper.findComponent(CategoryFilters)
      await filters.vm.$emit('update:gender', 'female')
      expect(wrapper.emitted('update:gender')).toEqual([['female']])
    })

    it('emits update:styles when CategoryFilters emits', async () => {
      const wrapper = createWrapper()
      const filters = wrapper.findComponent(CategoryFilters)
      await filters.vm.$emit('update:styles', ['all_mountain'])
      expect(wrapper.emitted('update:styles')).toEqual([[['all_mountain']]])
    })
  })

  describe('delete flow', () => {
    it('calls onDelete when delete is confirmed', async () => {
      const onDelete = vi.fn().mockResolvedValue(undefined)
      const wrapper = createWrapper({ onDelete })
      const deleteButton = wrapper.find('button[aria-label="Delete Burton Custom X"]')
      await deleteButton.trigger('click')
      const modal = wrapper.findComponent(DeleteConfirmationModal)
      await modal.vm.$emit('confirm')
      await wrapper.vm.$nextTick()
      expect(onDelete).toHaveBeenCalledWith(1)
    })
  })
})

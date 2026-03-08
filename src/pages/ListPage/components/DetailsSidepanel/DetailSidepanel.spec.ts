import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DetailSidepanel from './DetailSidepanel.vue'
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

function createWrapper(
  props: {
    open?: boolean
    selectedSnowboard?: Snowboard | null
  } = {}
) {
  return mount(DetailSidepanel, {
    props: {
      open: props.open ?? true,
      selectedSnowboard: props.selectedSnowboard ?? mockSnowboard,
      ...props,
    },
    attachTo: globalThis.document?.body,
    global: {
      stubs: {
        Sheet: {
          template: '<div v-if="open"><slot /></div>',
          props: ['open'],
        },
        SheetContent: { template: '<div><slot /></div>' },
        SheetHeader: { template: '<div><slot /></div>' },
        SheetTitle: { template: '<h2><slot /></h2>' },
        SheetDescription: { template: '<p><slot /></p>' },
      },
    },
  })
}

describe('DetailSidepanel', () => {
  it('renders "Snowboard details" when selectedSnowboard is null', () => {
    const wrapper = createWrapper({ selectedSnowboard: null })
    expect(wrapper.text()).toContain('Snowboard details')
  })

  it('renders snowboard title when selectedSnowboard is provided', () => {
    const wrapper = createWrapper({ selectedSnowboard: mockSnowboard })
    expect(wrapper.text()).toContain('Burton Custom X')
  })

  it('renders description when selectedSnowboard has description', () => {
    const wrapper = createWrapper({ selectedSnowboard: mockSnowboard })
    expect(wrapper.text()).toContain('All-mountain board for versatile riding')
  })

  it('renders brand', () => {
    const wrapper = createWrapper({ selectedSnowboard: mockSnowboard })
    expect(wrapper.text()).toContain('Brand')
    expect(wrapper.text()).toContain('Burton')
  })

  it('renders shape', () => {
    const wrapper = createWrapper({ selectedSnowboard: mockSnowboard })
    expect(wrapper.text()).toContain('Shape')
    expect(wrapper.text()).toContain('Directional')
  })

  it('renders stiffness', () => {
    const wrapper = createWrapper({ selectedSnowboard: mockSnowboard })
    expect(wrapper.text()).toContain('Stiffness')
    expect(wrapper.text()).toContain('7')
  })

  it('renders gender', () => {
    const wrapper = createWrapper({ selectedSnowboard: mockSnowboard })
    expect(wrapper.text()).toContain('Gender')
    expect(wrapper.text()).toContain('unisex')
  })

  it('renders price formatted as currency', () => {
    const wrapper = createWrapper({ selectedSnowboard: mockSnowboard })
    expect(wrapper.text()).toContain('Price')
    expect(wrapper.text()).toContain('€599.00')
  })

  it('renders discount percentage', () => {
    const wrapper = createWrapper({ selectedSnowboard: mockSnowboard })
    expect(wrapper.text()).toContain('Discount')
    expect(wrapper.text()).toContain('10%')
  })

  it('renders stock', () => {
    const wrapper = createWrapper({ selectedSnowboard: mockSnowboard })
    expect(wrapper.text()).toContain('Stock')
    expect(wrapper.text()).toContain('15')
  })

  it('renders sizes when present', () => {
    const wrapper = createWrapper({ selectedSnowboard: mockSnowboard })
    expect(wrapper.text()).toContain('Sizes')
    expect(wrapper.text()).toContain('150, 154, 158')
  })

  it('renders style badges when styles are present', () => {
    const wrapper = createWrapper({ selectedSnowboard: mockSnowboard })
    expect(wrapper.text()).toContain('Style')
    expect(wrapper.text()).toContain('all mountain')
    expect(wrapper.text()).toContain('freestyle')
  })

  it('does not render details section when selectedSnowboard is null', () => {
    const wrapper = createWrapper({ selectedSnowboard: null })
    expect(wrapper.text()).not.toContain('Burton')
    expect(wrapper.text()).not.toContain('Brand')
  })

  it('does not render sizes section when sizes array is empty', () => {
    const snowboardWithoutSizes: Snowboard = {
      ...mockSnowboard,
      sizes: [],
    }
    const wrapper = createWrapper({ selectedSnowboard: snowboardWithoutSizes })
    expect(wrapper.text()).toContain('Stock')
    expect(wrapper.html()).not.toContain('Sizes')
  })

  it('does not render style section when style array is empty', () => {
    const snowboardWithoutStyles: Snowboard = {
      ...mockSnowboard,
      style: [],
    }
    const wrapper = createWrapper({ selectedSnowboard: snowboardWithoutStyles })
    expect(wrapper.text()).toContain('Gender')
    expect(wrapper.html()).not.toMatch(/<dt[^>]*>Style<\/dt>/)
  })

  it('renders gender as "unisex" when gender is null', () => {
    const snowboardWithNullGender = {
      ...mockSnowboard,
      gender: undefined,
    } as unknown as Snowboard
    const wrapper = createWrapper({ selectedSnowboard: snowboardWithNullGender })
    expect(wrapper.text()).toContain('unisex')
  })
})

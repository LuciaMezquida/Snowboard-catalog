import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CategoryFilters from './CategoryFilters.vue'
import type { Gender, Style } from '@/types/snowboard'

function createWrapper(props: { gender?: Gender | ''; styles?: Style[] } = {}) {
  return mount(CategoryFilters, {
    props: {
      gender: props.gender ?? '',
      styles: props.styles ?? [],
      ...props,
    },
    attachTo: globalThis.document?.body,
  })
}

describe('CategoryFilters', () => {
  it('renders Category label', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Category')
  })

  it('shows "By gender" when no gender is selected', () => {
    const wrapper = createWrapper({ gender: '' })
    expect(wrapper.text()).toContain('By gender')
  })

  it('shows selected gender label when gender is selected', () => {
    const wrapper = createWrapper({ gender: 'male' })
    expect(wrapper.text()).toContain('Male')
  })

  it('shows "By style" when no styles are selected', () => {
    const wrapper = createWrapper({ styles: [] })
    expect(wrapper.text()).toContain('By style')
  })

  it('shows selected style labels when styles are selected', () => {
    const wrapper = createWrapper({ styles: ['freestyle'] })
    expect(wrapper.text()).toContain('Freestyle')
  })

  it('shows multiple style labels when multiple styles are selected', () => {
    const wrapper = createWrapper({ styles: ['freestyle', 'freeride'] })
    expect(wrapper.text()).toContain('Freestyle')
    expect(wrapper.text()).toContain('Freeride')
  })

  it('hides Clear all filters button when no filters are selected', () => {
    const wrapper = createWrapper({ gender: '', styles: [] })
    expect(wrapper.text()).not.toContain('Clear all filters')
  })

  it('shows Clear all filters button when gender is selected', () => {
    const wrapper = createWrapper({ gender: 'female', styles: [] })
    expect(wrapper.text()).toContain('Clear all filters')
  })

  it('shows Clear all filters button when styles are selected', () => {
    const wrapper = createWrapper({ gender: '', styles: ['all_mountain'] })
    expect(wrapper.text()).toContain('Clear all filters')
  })

  it('emits update:gender and update:styles when Clear all filters is clicked', async () => {
    const wrapper = createWrapper({ gender: 'male', styles: ['freestyle'] })
    const clearButton = wrapper.findAll('button').find((btn) => btn.text() === 'Clear all filters')
    expect(clearButton).toBeDefined()
    await clearButton!.trigger('click')

    expect(wrapper.emitted('update:gender')).toEqual([['']])
    expect(wrapper.emitted('update:styles')).toEqual([[[]]])
  })
})

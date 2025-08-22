import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TextContent from '../TextContent.vue'
import type { TextContent as TextContentType } from '@/types/scroll-item'

describe('TextContent', () => {
  const createTextContent = (overrides: Partial<TextContentType> = {}): TextContentType => ({
    text: 'Test Text',
    fontSize: 1.5,
    color: 'yellow',
    ...overrides,
  })

  it('should render text content', () => {
    const content = createTextContent()
    const wrapper = mount(TextContent, {
      props: { content },
    })

    expect(wrapper.text()).toContain('Test Text')
  })

  it('should apply correct styles', () => {
    const content = createTextContent({
      text: 'Styled Text',
      fontSize: 2.0,
      color: 'pink',
    })
    const wrapper = mount(TextContent, {
      props: { content },
    })

    const element = wrapper.find('.text-content')
    expect(element.exists()).toBe(true)
    
    const style = element.attributes('style')
    expect(style).toContain('font-size: 2em')
    
    expect(element.classes()).toContain('color-pink')
  })

  it('should handle long text with ellipsis', () => {
    const longText = 'This is a very long text that should be truncated with ellipsis'
    const content = createTextContent({
      text: longText,
    })
    const wrapper = mount(TextContent, {
      props: { content },
    })

    const displayedText = wrapper.text()
    expect(displayedText).toContain('...')
    expect(displayedText.length).toBeLessThan(longText.length)
  })

  it('should apply chalk-text class', () => {
    const wrapper = mount(TextContent, {
      props: { content: createTextContent() },
    })

    const element = wrapper.find('.text-content')
    expect(element.classes()).toContain('chalk-text')
  })

  it('should handle empty text', () => {
    const content = createTextContent({
      text: '',
    })
    const wrapper = mount(TextContent, {
      props: { content },
    })

    expect(wrapper.text()).toBe('')
  })

  it('should handle special characters', () => {
    const specialText = '<script>alert("XSS")</script>'
    const content = createTextContent({
      text: specialText,
    })
    const wrapper = mount(TextContent, {
      props: { content },
    })

    // Vue automatically escapes HTML
    // Text is exactly 30 characters, so no ellipsis
    expect(wrapper.text()).toBe(specialText)
    expect(wrapper.html()).not.toContain('<script>')
  })

  it('should update when props change', async () => {
    const content = createTextContent()
    const wrapper = mount(TextContent, {
      props: { content },
    })

    expect(wrapper.text()).toContain('Test Text')

    const newContent = createTextContent({
      text: 'Updated Text',
    })
    
    await wrapper.setProps({ content: newContent })
    expect(wrapper.text()).toContain('Updated Text')
  })

  it('should apply correct color classes', () => {
    const colors: Array<'yellow' | 'pink' | 'blue' | 'green' | 'white'> = ['yellow', 'pink', 'blue', 'green', 'white']
    
    for (const color of colors) {
      const content = createTextContent({ color })
      const wrapper = mount(TextContent, {
        props: { content },
      })
      
      const element = wrapper.find('.text-content')
      expect(element.classes()).toContain(`color-${color}`)
    }
  })

  it('should apply correct font size', () => {
    const sizes = [0.8, 1.0, 1.5, 2.0, 2.5]
    
    for (const fontSize of sizes) {
      const content = createTextContent({ fontSize })
      const wrapper = mount(TextContent, {
        props: { content },
      })
      
      const element = wrapper.find('.text-content')
      const style = element.attributes('style')
      expect(style).toContain(`font-size: ${fontSize}em`)
    }
  })
})
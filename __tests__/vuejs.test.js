const { axe, toHaveNoViolations } = require('../index')

const Image = {
  data: () => ({ src: '#' }),
  template: '<img id="test-image" :src="src" />'
};

expect.extend(toHaveNoViolations)

describe('Vue', () => {
  it('renders correctly', async () => {
    const { mount } = require('@vue/test-utils');
    const wrapper = mount(Image)
    const results = await axe(wrapper.element);
    
    expect(() => {
      expect(results).toHaveNoViolations()
    }).toThrowErrorMatchingSnapshot()
  })

  it('renders a vue testing library container correctly', async () => {
    const { render, cleanup } = require('@testing-library/vue');
    const { container } = render(Image)
    const results = await axe(container)
    
    expect(() => {
      expect(results).toHaveNoViolations()
    }).toThrowErrorMatchingSnapshot()

    cleanup()
  })

})
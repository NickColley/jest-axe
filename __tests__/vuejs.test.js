const { axe, toHaveNoViolations } = require('../index')

const { mount } = require("@vue/test-utils");

expect.extend(toHaveNoViolations)

describe('Vue', () => {
  it('renders correctly', async () => {
    const Image = require('./Image.vue')
    const wrapper = mount(Image)
    const results = await axe(wrapper.element);
    
    expect(() => {
      expect(results).toHaveNoViolations()
    }).toThrowErrorMatchingSnapshot()
  })

})
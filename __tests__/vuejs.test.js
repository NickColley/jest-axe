const { axe, toHaveNoViolations } = require('../index')

expect.extend(toHaveNoViolations)

const Image = require('./Image.vue')

describe('Vue', () => {
  it('renders correctly', async () => {

    let results = await axe(Image)
    
    expect(() => {
      expect(results).toHaveNoViolations()
    }).toThrowErrorMatchingSnapshot()
  })
})
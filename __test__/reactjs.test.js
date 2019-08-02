const { axe, toHaveNoViolations } = require('../index')

const React = require('react')
const ReactDOMServer = require('react-dom/server')
const { render } = require('@testing-library/react')

expect.extend(toHaveNoViolations)

describe('React', () => {

  it('renders correctly', async () => {
    const html = ReactDOMServer.renderToString(
      React.createElement('img', { src: '#' })
    )

    const results = await axe(html)

    expect(() => {
      expect(results).toHaveNoViolations()
    }).toThrowErrorMatchingSnapshot()
  })

  it('renders a react element correctly', async () => {
    const results = await axe(
      React.createElement('img', { src: '#' })
    )

    expect(() => {
      expect(results).toHaveNoViolations()
    }).toThrowErrorMatchingSnapshot()
  })

  it('renders a react testing library container correctly', async () => {
    const { container } = render(React.createElement('img', { src: '#' }))
    const results = await axe(container)

    expect(() => {
      expect(results).toHaveNoViolations()
    }).toThrowErrorMatchingSnapshot()
  })
})
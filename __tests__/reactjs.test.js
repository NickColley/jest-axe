const React = require('react')
const ReactDOMServer = require('react-dom/server')
const { render } = require('@testing-library/react')

const { axe, toHaveNoViolations } = require('../index')

expect.extend(toHaveNoViolations)

describe('React', () => {

  test('renders correctly', async () => {
    const element = React.createElement('img', { src: '#' })
    const html = ReactDOMServer.renderToString(element)

    const results = await axe(html)
    expect(() => {
      expect(results).toHaveNoViolations()
    }).toThrowErrorMatchingSnapshot()
  })

  test('renders a react testing library container correctly', async () => {
    const element = React.createElement('img', { src: '#' })
    const { container } = render(element)
    const results = await axe(container)
    
    expect(() => {
      expect(results).toHaveNoViolations()
    }).toThrowErrorMatchingSnapshot()
  })

  test('renders a react testing library container without duplicate ids', async () => {
    const element = React.createElement('img', { src: '#', alt: 'test', id: 'test' })
    const { container } = render(element)
    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })
})

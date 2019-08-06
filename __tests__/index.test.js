/* eslint-env jest */

const { configureAxe, axe, toHaveNoViolations } = require('../index.js')

describe('jest-axe', () => {
  describe('axe', () => {
    const failingHtmlExample = `
     <html>
       <body>
         <a href="#"></a>
       </body>
     </html>
    `

    const failingExtendedHtmlExample = `
     <html>
       <body>
         <a href="#"></a>
         <img src="#"/>
       </body>
     </html>
    `

    const goodHtmlExample = `
     <html>
       <body>
         <a href="http://gov.uk">Visit GOV.UK</a>
       </body>
     </html>
    `

    const linkNameAxe = configureAxe({
      rules: {
        'link-name': { enabled: false }
      }
    })

    it('can be configured for global configs', async () => {
      const results = await linkNameAxe(failingHtmlExample)
      const violations = results.violations
      expect(violations.length).toBe(0)
    })

    it('can pass in merged configurations to configured axe', async () => {
      const results = await linkNameAxe(failingExtendedHtmlExample, {
        rules: {
          'image-alt': { enabled: false }
        }
      })
      const violations = results.violations
      expect(violations.length).toBe(0)
    })

    it('returns an axe results object', async () => {
      const results = await axe(failingHtmlExample)
      expect(typeof results).toBe('object')
      expect(typeof results.violations).toBe('object')
    })

    it('should not mutate the content of document.body permanently', async () => {
      const el = document.body.appendChild(document.createElement("div"))
      await axe(goodHtmlExample)
      expect(document.body.childElementCount).toBe(1)
      expect(document.body.firstChild).toEqual(el)
    })

    it('returns violations for failing html example', async () => {
      const results = await axe(failingHtmlExample)
      const violation = results.violations[0]
      expect(violation.id).toBe('link-name')
      expect(violation.description).toBe('Ensures links have discernible text')
    })

    it('can ignore allowed failures', async () => {
      const results = await axe(failingHtmlExample, {
        rules: {
          'link-name': { enabled: false }
        }
      })
      const violations = results.violations
      expect(violations.length).toBe(0)
    })

    it('returns no violations for a good html example', async () => {
      const results = await axe(goodHtmlExample)
      const violations = results.violations
      expect(violations.length).toBe(0)
    })

    it('throws if input is not a string, vue element, react element, or react testing library render', () => {
      expect(() => {
        axe({})
      }).toThrow('html parameter should be an HTML string or an HTML element')
    })

    it('throws with non-html input', () => {
      expect(() => {
        axe('Hello, World')
      }).toThrow('html parameter ("Hello, World") has no elements')
    })

    it('should not mutate previous options', async () => {
      let results = await axe(failingHtmlExample, {
        rules: {
          'link-name': { enabled: false }
        }
      })
      let violations = results.violations
      expect(violations.length).toBe(0)

      const configuredAxe = configureAxe({
        rules: {
          'link-name': { enabled: false }
        }
      })

      results = await configuredAxe(failingHtmlExample, {
        rules: {
          'link-name': { enabled: false }
        }
      })
      violations = results.violations
      expect(violations.length).toBe(0)

      results = await axe(failingHtmlExample)
      const violation = results.violations[0]
      expect(violation.id).toBe('link-name')
      expect(violation.description).toBe('Ensures links have discernible text')
    })
  })

  describe('toHaveNoViolations', () => {
    const failingAxeResults = {
      violations: [
        {
          id: 'image-alt',
          impact: 'critical',
          tags: [
            'cat.text-alternatives',
            'wcag2a',
            'wcag111',
            'section508',
            'section508.22.a'
          ],
          description: 'Ensures <img> elements have alternate text or a role of none or presentation',
          help: 'Images must have alternate text',
          helpUrl: 'https://dequeuniversity.com/rules/axe/2.6/image-alt?application=axeAPI',
          nodes: [
            {
              any: [
                {
                  id: 'has-alt',
                  data: null,
                  relatedNodes: [],
                  impact: 'critical',
                  message: 'Element does not have an alt attribute'
                },
                {
                  id: 'aria-label',
                  data: null,
                  relatedNodes: [],
                  impact: 'serious',
                  message: 'aria-label attribute does not exist or is empty'
                },
                {
                  id: 'aria-labelledby',
                  data: null,
                  relatedNodes: [],
                  impact: 'serious',
                  message: 'aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty or not visible'
                },
                {
                  id: 'non-empty-title',
                  data: null,
                  relatedNodes: [],
                  impact: 'serious',
                  message: 'Element has no title attribute or the title attribute is empty'
                },
                {
                  id: 'role-presentation',
                  data: null,
                  relatedNodes: [],
                  impact: 'minor',
                  message: 'Element\'s default semantics were not overridden with role="presentation"'
                },
                {
                  id: 'role-none',
                  data: null,
                  relatedNodes: [],
                  impact: 'minor',
                  message: 'Element\'s default semantics were not overridden with role="none"'
                }
              ],
              all: [],
              none: [],
              impact: 'critical',
              html: '<img src="">',
              target: [ 'body > img' ],
              failureSummary: 'Fix any of the following:\n  Element does not have an alt attribute\n  aria-label attribute does not exist or is empty\n  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty or not visible\n  Element has no title attribute or the title attribute is empty\n  Element\'s default semantics were not overridden with role="presentation"\n  Element\'s default semantics were not overridden with role="none"'
            }
          ]
        }
      ]
    }

    const successfulAxeResults = {
      violations: []
    }
    it('returns a jest matcher object with object', () => {
      const matcherFunction = toHaveNoViolations.toHaveNoViolations
      expect(matcherFunction).toBeDefined()
      expect(typeof matcherFunction).toBe('function')
    })

    it('throws error if non axe results object is passed', () => {
      const matcherFunction = toHaveNoViolations.toHaveNoViolations
      expect(() => {
        matcherFunction({})
      }).toThrow('No violations found in aXe results object')
    })

    it('returns pass as true when no violations are present', () => {
      const matcherFunction = toHaveNoViolations.toHaveNoViolations
      const matcherOutput = matcherFunction(successfulAxeResults)
      expect(matcherOutput.pass).toBe(true)
    })

    it('returns same violations that are passed in the results object', () => {
      const matcherFunction = toHaveNoViolations.toHaveNoViolations
      const matcherOutput = matcherFunction(failingAxeResults)
      expect(matcherOutput.actual).toBe(failingAxeResults.violations)
    })

    it('returns correctly formatted message when violations are present', () => {
      const matcherFunction = toHaveNoViolations.toHaveNoViolations
      const matcherOutput = matcherFunction(failingAxeResults)
      expect(typeof matcherOutput.message).toBe('function')
      expect(matcherOutput.message()).toMatchSnapshot()
    })

    it('returns pass as false when violations are present', () => {
      const matcherFunction = toHaveNoViolations.toHaveNoViolations
      const matcherOutput = matcherFunction(failingAxeResults)
      expect(matcherOutput.pass).toBe(false)
    })

    it('returns properly formatted text with more complex example', async () => {
      const complexHtmlExample = `
        <html>
          <body>
            <a href="#link-name"></a>
            <a href="#link-name-2"></a>
            <img src="http://example.com"/>
            <img src="http://example.com/2"/>

            <input type="text"/>
          </body>
        </html>
      `
      const results = await axe(complexHtmlExample)
      const matcherFunction = toHaveNoViolations.toHaveNoViolations
      const matcherOutput = matcherFunction(results)
      expect(matcherOutput.message()).toMatchSnapshot()
    })
  })
  describe('readme', () => {
    describe('first readme example', () => {

      expect.extend(toHaveNoViolations)

      it('should demonstrate this matcher`s usage', async () => {
        const render = () => '<img src="#"/>'

        // pass anything that outputs html to axe
        const html = render()

        const results = await axe(html)

        expect(() => {
          expect(results).toHaveNoViolations()
        }).toThrowErrorMatchingSnapshot()
      })
    })
    describe('readme axe config example', () => {

      expect.extend(toHaveNoViolations)

      it('should demonstrate this matcher`s usage with a custom config', async () => {
        const render = () => `
          <div>
            <img src="#"/>
          </div>
        `

        // pass anything that outputs html to axe
        const html = render()

        const results = await axe(html, {
          rules: {
            // for demonstration only, don't disable rules that need fixing.
            'image-alt': { enabled: false }
          }
        })

        expect(results).toHaveNoViolations()
      })
    })
    describe('readme axe global config example', () => {
      // Global helper file (axe-helper.js)

      const configuredAxe = configureAxe({
        rules: {
          // for demonstration only, don't disable rules that need fixing.
          'image-alt': { enabled: false }
        }
      })

      const exportedAxe = configuredAxe

      // Individual test file (test.js)
      const axe = exportedAxe // require('./axe-helper.js')

      expect.extend(toHaveNoViolations)

      it('should demonstrate this matcher`s usage with a default config', async () => {
        const render = () => `
          <div>
            <img src="#"/>
          </div>
        `

        // pass anything that outputs html to axe
        const html = render()

        expect(await axe(html)).toHaveNoViolations()
      })
    })
  })
})

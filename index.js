'use strict'
const axeCore = require('axe-core')
const merge = require('lodash.merge')
const chalk = require('chalk')
const { printReceived, matcherHint } = require('jest-matcher-utils')

/**
 * Converts a HTML string or HTML element to a mounted HTML element.
 * @param {Element | string} a HTML element or a HTML string
 * @returns {[Element, function]} a HTML element and a function to restore the document
 */
function mount (html) {
  if (isHTMLElement(html)) {
    if (document.body.contains(html)) {
      return [html, () => undefined]
    }

    html = html.outerHTML
  }

  if (isHTMLString(html)) {
    const originalHTML = document.body.innerHTML
    const restore = () => {
      document.body.innerHTML = originalHTML
    }

    document.body.innerHTML = html
    return [document.body, restore]
  }

  if (typeof html === 'string') {
    throw new Error(`html parameter ("${html}") has no elements`)
  }

  throw new Error(`html parameter should be an HTML string or an HTML element`)
}

/**
 * Small wrapper for axe-core#run that enables promises (required for Jest),
 * default options and injects html to be tested
 * @param {object} [defaultOptions] default options to use in all instances
 * @returns {function} returns instance of axe
 */
function configureAxe (defaultOptions = {}) {
  /**
   * Small wrapper for axe-core#run that enables promises (required for Jest),
   * default options and injects html to be tested
   * @param {string} html requires a html string to be injected into the body
   * @param {object} [additionalOptions] aXe options to merge with default options
   * @returns {promise} returns promise that will resolve with axe-core#run results object
   */
  return function axe (html, additionalOptions = {}) {
    const [element, restore] = mount(html)
    const options = merge({}, defaultOptions, additionalOptions)

    return new Promise((resolve, reject) => {
      axeCore.run(element, options, (err, results) => {
        restore()
        if (err) throw err
        resolve(results)
      })
    })
  }
}

/**
 * Checks if the HTML parameter provided is a HTML element.
 * @param {Element} a HTML element or a HTML string
 * @returns {boolean} true or false
 */
function isHTMLElement (html) {
  return !!html && typeof html === 'object' && typeof html.tagName === 'string'
}

/**
 * Checks that the HTML parameter provided is a string that contains HTML.
 * @param {string} a HTML element or a HTML string
 * @returns {boolean} true or false
 */
function isHTMLString (html) {
  return typeof html === 'string' && /(<([^>]+)>)/i.test(html)
}

/**
 * Custom Jest expect matcher, that can check aXe results for violations.
 * @param {object} object requires an instance of aXe's results object
 * (https://github.com/dequelabs/axe-core/blob/develop-2x/doc/API.md#results-object)
 * @returns {object} returns Jest matcher object
 */
const toHaveNoViolations = {
  toHaveNoViolations (results) {
    const violations = results.violations

    if (typeof violations === 'undefined') {
      throw new Error('No violations found in aXe results object')
    }

    const reporter = violations => {
      if (violations.length === 0) {
        return []
      }

      const lineBreak = '\n\n'
      const horizontalLine = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500'

      return violations.map(violation => {
        const errorBody = violation.nodes.map(node => {
          const selector = node.target.join(', ')
          const expectedText = `Expected the HTML found at $('${selector}') to have no violations:` + lineBreak
          return (
            expectedText +
            chalk.grey(node.html) +
            lineBreak +
            `Received:` +
            lineBreak +
            printReceived(`${violation.help} (${violation.id})`) +
            lineBreak +
            chalk.yellow(node.failureSummary) +
            lineBreak +
            `You can find more information on this issue here: \n` +
            chalk.blue(violation.helpUrl)
          )
        }).join(lineBreak)

        return (errorBody)
      }).join(lineBreak + horizontalLine + lineBreak)
    }

    const formatedViolations = reporter(violations)
    const pass = formatedViolations.length === 0

    const message = () => {
      if (pass) {
        return
      }
      return matcherHint('.toHaveNoViolations') +
            '\n\n' +
            `${formatedViolations}`
    }

    return { actual: violations, message, pass }
  }
}

module.exports = {
  configureAxe,
  axe: configureAxe(),
  toHaveNoViolations
}

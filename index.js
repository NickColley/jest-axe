'use strict'
const axeCore = require('axe-core')
const merge = require('lodash.merge')
const { printReceived, matcherHint } = require('jest-matcher-utils')

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
    let htmlType = typeof html;
    let originalBodyHTML;
        
    // If the passed html value is a DOM node, use the outerHTML of the node
    if (htmlType === 'object' && !!html.tagName) {
      html = html.outerHTML
      htmlType = typeof html;
    }

    if (htmlType === 'string') {
      
      const htmlHasHTMLElements = /(<([^>]+)>)/i.test(html)
      if (!htmlHasHTMLElements) {
        throw new Error(`html parameter ("${html}") has no elements`)
      }
      // Before we test the submitted html, we store the document body HTML.
      originalBodyHTML = document.body.innerHTML

      // Replace the document body with the submitted html.
      // We do this to avoid any duplicate code, often from testing libraries, from showing up during out tests
      document.body.innerHTML = html
    }
    else {
      throw new Error(`html parameter should be a string not a ${htmlType}`)
    }

    const options = merge({}, defaultOptions, additionalOptions)

    return new Promise((resolve, reject) => {
      axeCore.run(document.body, options, (err, results) => {
        // Once we have finished testing the html, we restore the original html body
        document.body.innerHTML = originalBodyHTML
        if (err) throw err
        resolve(results)
      })
    })
  }
}

/**
 * Custom Jest expect matcher, that can check aXe results for violations.
 * @param {results} object requires an instance of aXe's results object
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
        const htmlAndTarget = violation.nodes.map(node => {
          const selector = node.target.join(', ')
          return (
            `Expected the HTML found at $('${selector}') to have no violations:` +
            lineBreak +
            node.html
          )
        }).join(lineBreak)

        return (
          htmlAndTarget +
          lineBreak +
          `Received:` +
          lineBreak +
          printReceived(`${violation.help} (${violation.id})`) +
          lineBreak +
          `Try fixing it with this help: ${violation.helpUrl}`
        )
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
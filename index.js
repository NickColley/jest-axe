'use strict'

const axeCore = require('axe-core')
const merge = require('lodash.merge')
const chalk = require('chalk')
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
   * @param {string|HTMLElement} htmlOrEl requires a html string to be injected into the body
   * @param {object} [additionalOptions] aXe options to merge with default options
   * @returns {promise} returns promise that will resolve with axe-core#run results object
   */
  return function axe (htmlOrEl, additionalOptions = {}) {
    let el
    let elAlreadyInBody
    const htmlType = typeof htmlOrEl
    if (htmlType === 'string') {
      const html = htmlOrEl
      const hasHtmlElements = /(<([^>]+)>)/i.test(html)
      if (!hasHtmlElements) {
        throw new Error(`html parameter ("${html}") has no elements`)
      }
      el = document.createElement('div')
      el.innerHTML = html
      elAlreadyInBody = false
    } else if (htmlOrEl instanceof HTMLElement) {
      el = htmlOrEl
      elAlreadyInBody = document.body.contains(el)
    } else {
      throw new Error(
        `html parameter should be a string or HTMLElement not a ${htmlType}`,
      )
    }

    if (!elAlreadyInBody) {
      document.body.appendChild(el)
    }

    const options = merge({}, defaultOptions, additionalOptions)

    return new Promise((resolve, reject) => {
      axeCore.run(el, options, (err, results) => {
        // In any case we restore the contents of the body by removing the additional element again.
        if (!elAlreadyInBody) {
          document.body.removeChild(el)
        }

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

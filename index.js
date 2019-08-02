'use strict'
const axeCore = require('axe-core')
const merge = require('lodash.merge')
const { printReceived, matcherHint } = require('jest-matcher-utils')
const { renderToString: renderReactNodeToString } = require('react-dom/server')
const { renderToString: renderVueNodeToString } = require('@vue/server-test-utils')

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
    let axeContainer, addedToDOM
    
    if (isReactElement(html)) {
      html = renderReactNodeToString(html)
    }

    if (isVueElement(html)) {
      html = renderVueNodeToString(html)
    }

    const htmlType = typeof html
    if (htmlType === 'string') {
      const hasHtmlElements = /(<([^>]+)>)/i.test(html)
      if (!hasHtmlElements) {
        throw new Error(`html parameter ("${html}") has no elements`)
      }

      // Before we use Jests's jsdom document we store and remove all child nodes from the body.
      axeContainer = document.createElement('div');
      axeContainer.innerHTML = html
      // aXe requires real Nodes so we need to inject into Jests' jsdom document.
      document.body.appendChild(axeContainer)
      addedToDOM = true
    }
    // Check for React Testing Library Container
    else if (isReactTestingLibraryContainer(html)) {
      // Render react-testing-component dom object directly
      axeContainer = html
    }
    else if (htmlType !== 'string') {
      throw new Error(`html parameter should be a string not a ${htmlType}`)
    }

    const options = merge({}, defaultOptions, additionalOptions)

    return new Promise((resolve, reject) => {
      axeCore.run(axeContainer, options, (err, results) => {
        // In any case we restore the contents of the body by removing the additional element again.
        addedToDOM && document.body.removeChild(axeContainer)

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

/**
 * Custom util for identifying if the submitted html is a React element
 * @param {string} html requires a html string to be injected into the body
 * @returns {boolean} returns true or false
 */
const isReactElement = html => !!html.$$typeof && /react/i.test(String(html.$$typeof))

/**
 * Custom util for identifying if the submitted html is a React Testing Library container
 * @param {string} html requires a html string to be injected into the body
 * @returns {boolean} returns true or false
 */
const isReactTestingLibraryContainer = html => typeof html === 'object' && html._reactRootContainer

/**
 * Custom util for identifying if the submitted html is a Vue element
 * @param {string} html requires a html string to be injected into the body
 * @returns {boolean} returns true or false
 */
const isVueElement = html => typeof html === 'object' && html.staticRenderFns


module.exports = {
  configureAxe,
  axe: configureAxe(),
  toHaveNoViolations
}
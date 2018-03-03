# jest-axe

[![Greenkeeper badge](https://badges.greenkeeper.io/nickcolley/jest-axe.svg)](https://greenkeeper.io/)
[![npm version](https://img.shields.io/npm/v/jest-axe.svg)](http://npm.im/jest-axe)
[![Build Status](https://travis-ci.org/nickcolley/jest-axe.svg?branch=master)](https://travis-ci.org/nickcolley/jest-axe)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Custom [Jest](https://jest-bot.github.io/jest/) matcher for [aXe](https://github.com/dequelabs/axe-core) for testing accessibility

## Installation:
```bash
npm install --save-dev jest-axe
```

## Usage:

```javascript
const { axe, toHaveNoViolations } = require('jest-axe')

expect.extend(toHaveNoViolations)

it('should demonstrate this matcher`s usage', async () => {
  const render = () => '<img src="#"/>'

  // pass anything that outputs html to axe
  const html = render()

  expect(await axe(html)).toHaveNoViolations()
})
```

![Screenshot of the resulting output from the usage example](example-cli.png)

### With React

```javascript
const { axe, toHaveNoViolations } = require('jest-axe')

expect.extend(toHaveNoViolations)

const React = require('react')
const ReactDOMServer = require('react-dom/server')

it('should demonstrate this matcher`s usage with react', async () => {
  const html = ReactDOMServer.renderToString(
    <img src='#' />
  )

  const results = await axe(html)

  expect(results).toHaveNoViolations()
})
```

### Axe configuration

The `axe` function allows options to be set, these are the [same options as documented in axe-core](https://github.com/dequelabs/axe-core/blob/develop-2x/doc/API.md#options-parameter)

```javascript
const { axe, toHaveNoViolations } = require('jest-axe')

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
```

## Setting global configuration

If you find yourself repeating the same options multiple times, you can export a version of the `axe` function with defaults set.

Note: You can still pass additional options to this new instance, they will be merged with the defaults.

This could be done in [Jest's setup step](https://facebook.github.io/jest/docs/en/setup-teardown.html)

```javascript
// Global helper file (axe-helper.js)
const { configureAxe } = require('jest-axe')

const axe = configureAxe({
  rules: {
    // for demonstration only, don't disable rules that need fixing.
    'image-alt': { enabled: false }
  }
})

module.exports = axe
```

```javascript
// Individual test file (test.js)
const { toHaveNoViolations } = require('jest-axe')
const axe = require('./axe-helper.js')

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
```

## Thanks
- [Jest](https://facebook.github.io/jest/) for the great test runner that allows extending matchers.
- [aXe](https://www.axe-core.org/) for the wonderful axe-core that makes it so easy to do this.
- Government Digital Service for making coding in the open the default.
  - GOV.UK Publishing Frontend team who published the [basis of the aXe reporter](https://github.com/alphagov/govuk_publishing_components/blob/581c22c9d35d85d5d985571d007f6397a4399f4c/spec/javascripts/govuk_publishing_components/AccessibilityTestSpec.js)
- [jest-image-snapshot](https://github.com/americanexpress/jest-image-snapshot) for inspiration on README and repo setup

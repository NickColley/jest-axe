# jest-axe

[![npm version](https://img.shields.io/npm/v/jest-axe.svg)](http://npm.im/jest-axe)
![node](https://img.shields.io/node/v/jest-axe)
[![Repository CI Status](https://github.com/nickcolley/jest-axe/workflows/test/badge.svg)](https://github.com/nickcolley/jest-axe/actions?query=workflow%3Atest)

Custom [Jest][Jest] matcher for [axe](https://github.com/dequelabs/axe-core) for testing accessibility

## ⚠️✋ This project does not guarantee that what you build is accessible.
The GDS Accessibility team found that around [~30% of access barriers are missed by automated testing](https://accessibility.blog.gov.uk/2017/02/24/what-we-found-when-we-tested-tools-on-the-worlds-least-accessible-webpage).

Tools like axe are similar to [code linters](https://en.wikipedia.org/wiki/Lint_%28software%29) such as [eslint](https://eslint.org/) or [stylelint](https://stylelint.io/): they can find common issues but cannot guarantee that what you build works for users.

You'll also need to:
- test your interface with the [assistive technologies that real users use](https://www.gov.uk/service-manual/technology/testing-with-assistive-technologies#when-to-test) (see also [WebAIM's survey results](https://webaim.org/projects/screenreadersurvey8/#primary)).
- include disabled people in user research.

### Checks that do not work in jest-axe

Color contrast checks do not work in JSDOM so are turned off in jest-axe.

## Installation:
```bash
npm install --save-dev jest jest-axe jest-environment-jsdom
```

[TypeScript](https://www.typescriptlang.org/) users can install the community maintained types package:

```bash
npm install --save-dev @types/jest-axe
```

## Usage:

```javascript
/**
 * @jest-environment jsdom
 */
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

> Note, you can also require `'jest-axe/extend-expect'` which will call `expect.extend` for you.
> This is especially helpful when using the jest `setupFilesAfterEnv` configuration.

### Testing React

```javascript
const React = require('react')
const { render } =  require('react-dom')
const App = require('./app')

const { axe, toHaveNoViolations } = require('jest-axe')
expect.extend(toHaveNoViolations)

it('should demonstrate this matcher`s usage with react', async () => {
  render(<App/>, document.body)
  const results = await axe(document.body)
  expect(results).toHaveNoViolations()
})
```

### Testing React with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)

```javascript
const React = require('react')
const App = require('./app')

const { render } = require('@testing-library/react')
const { axe, toHaveNoViolations } = require('jest-axe')
expect.extend(toHaveNoViolations)

it('should demonstrate this matcher`s usage with react testing library', async () => {
  const { container } = render(<App/>)
  const results = await axe(container)
  
  expect(results).toHaveNoViolations()
})
```

> Note: If you're using `react testing library` <9.0.0 you should be using the
> [`cleanup`](https://testing-library.com/docs/react-testing-library/api#cleanup) method. This method removes the rendered application from the DOM and ensures a clean HTML Document for further testing.

If you're using [React Portals](https://reactjs.org/docs/portals.html), use the [`baseElement`](https://testing-library.com/docs/react-testing-library/api#baseelement) instead of `container`:

```js
it('should work with React Portals as well', async () => {
  const { baseElement } = render(<App/>)
  const results = await axe(baseElement)
  
  expect(results).toHaveNoViolations()
})
```

### Testing Vue with [Vue Test Utils](https://vue-test-utils.vuejs.org/)

```javascript
const App = require('./App.vue')

const { mount } = require('@vue/test-utils')
const { axe, toHaveNoViolations } = require('jest-axe')
expect.extend(toHaveNoViolations)

it('should demonstrate this matcher`s usage with vue test utils', async () => {
  const wrapper = mount(Image)
  const results = await axe(wrapper.element)

  expect(results).toHaveNoViolations()
})
```

### Testing Vue with [Vue Testing Library](https://testing-library.com/docs/vue-testing-library/intro)

```javascript
const App = require('./app')

const { render } = require('@testing-library/vue')
const { axe, toHaveNoViolations } = require('jest-axe')
expect.extend(toHaveNoViolations)

it('should demonstrate this matcher`s usage with react testing library', async () => {
  const { container } = render(<App/>)
  const results = await axe(container)
  
  expect(results).toHaveNoViolations()
})
```
> Note: If you're using `vue testing library` <3.0.0 you should be using the
> [`cleanup`](https://testing-library.com/docs/vue-testing-library/api#cleanup) method. This method removes the rendered application from the DOM and ensures a clean HTML Document for further testing.

### Testing Angular with [Nx](https://nx.dev/)

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { axe } from "jest-axe";

import { SomeComponent } from "./some.component";

describe("SomeComponent", () => {
  let fixture: ComponentFixture<SomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SomeComponent],
    });

    fixture = TestBed.createComponent(SomeComponent);
  });

  it("should create", async () => {
    const results = await axe(fixture.nativeElement);
    expect(results).toHaveNoViolations();
  });
});
```

> Note: You may need to extend jest by importing `jest-axe/extend-expect` at `test-setup.ts`

### Usage with jest.useFakeTimers() or mocking setTimeout

> thrown: "Exceeded timeout of 5000 ms for a test.
> Use jest.setTimeout(newTimeout) to increase the timeout value, if this is a long-running test."

aXe core does not work when timers (setTimeout) are mocked. When using `jest.useFakeTimers()` aXe core will timeout often causing failing tests.

We recommend renabling the timers temporarily for aXe:

```javascript
jest.useRealTimers();
const results = await axe(wrapper.element);
jest.useFakeTimers();
```

### Axe configuration

The `axe` function allows options to be set with the [same options as documented in axe-core](https://github.com/dequelabs/axe-core/blob/master/doc/API.md#options-parameter):

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

### Testing isolated components

> All page content must be contained by landmarks (region)

When testing with aXe sometimes it assumes you are testing a page. This then results in unexpected violations for landmarks for testing isolation components.

You can disable this behaviour with the `region` rule:

```javascript
const { configureAxe } = require('jest-axe')

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    'region': { enabled: false }
  }
})
```

## Setting global configuration

If you find yourself repeating the same options multiple times, you can export a version of the `axe` function with defaults set.

Note: You can still pass additional options to this new instance; they will be merged with the defaults.

This could be done in [Jest's setup step](https://jestjs.io/docs/en/setup-teardown)

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

### Setting custom rules and checks.

The configuration object passed to `configureAxe`, accepts a `globalOptions` property to configure the format of the data used by axe and to add custom checks and rules. The property value is the same as the parameter passed to [axe.configure](https://github.com/dequelabs/axe-core/blob/master/doc/API.md#parameters-1). 

```javascript
// Global helper file (axe-helper.js)
const { configureAxe } = require('jest-axe')

const axe = configureAxe({
  globalOptions: {
    checks: [/* custom checks definitions */]
  },
  // ...
})

module.exports = axe
```

### Setting the level of user impact.

An array which defines which [impact](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md) level should be considered. This ensures that only violations with a specific impact on the user are considered. The level of impact can be "minor", "moderate", "serious", or "critical".

```javascript
// Global helper file (axe-helper.js)
const { configureAxe } = require('jest-axe')

const axe = configureAxe({
  impactLevels: ['critical'],
  // ...
})

module.exports = axe
```

Refer to [Developing Axe-core Rules](https://github.com/dequelabs/axe-core/blob/master/doc/rule-development.md) for instructions on how to develop custom rules and checks.

## Thanks
- [Jest][Jest] for the great test runner that allows extending matchers.
- [axe](https://www.deque.com/axe/) for the wonderful axe-core that makes it so easy to do this.
- Government Digital Service for making coding in the open the default.
  - GOV.UK Publishing Frontend team who published the [basis of the aXe reporter](https://github.com/alphagov/govuk_publishing_components/blob/581c22c9d35d85d5d985571d007f6397a4399f4c/spec/javascripts/govuk_publishing_components/AccessibilityTestSpec.js)
- [jest-image-snapshot](https://github.com/americanexpress/jest-image-snapshot) for inspiration on README and repo setup

[Jest]: https://jestjs.io/

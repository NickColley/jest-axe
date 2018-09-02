// this allows users to simply add `require('jest-axe/extend-expect')`
// at the top of their test file rather than have two lines for this.
// it also allows users to use jest's setupFiles configuration and
// point directly to `jest-axe/extend-expect`
const { toHaveNoViolations } = require('jest-axe')

expect.extend(toHaveNoViolations)


/* 

This allows users to add `require('jest-axe/extend-expect')`
at the top of their test file rather than have two lines for this.

It also allows users to use jest's setupFiles configuration and
point directly to `jest-axe/extend-expect`

*/

const { toHaveNoViolations } = require("./");

expect.extend(toHaveNoViolations);

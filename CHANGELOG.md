# 3.2.0

- Improved support for using DOM nodes which makes jest-axe work better with testing libraries such as @testing-library, React and Vue - thanks to [@dakebl](https://github.com/dakebl) for contributing this, and everyone for helping review this.
- Improved help text output including colour highlighting - thanks to [@dakebl](https://github.com/dakebl)
- Update axe-core to 3.3.1, you may need to update any snapshot tests.
- Update dependencies to avoid vulnerability warnings - thanks to [@chimericdream](https://github.com/chimericdream) for the prompt

See the [full 3.2.0 milestone](https://github.com/nickcolley/jest-axe/milestone/1) for all related issues and pull requests.

# 3.1.1

- Ensure that jest-axe cleans up the document after it runs [(Issue #50)](https://github.com/nickcolley/jest-axe/issues/50) Thanks @thomasheyenbrock and @camdub !
- Update axe-core to 3.1.2

# 3.1.0

- Add extend-expect file - [(PR #44)](https://github.com/nickcolley/jest-axe/pull/44) Thanks @kentcdodds
- Update axe-core to v3.1.1, update jest-matcher-utils to 23.5.0

# 3.0.0

- Allow Node.js 6.x to use jest-axe - [(PR #40)](https://github.com/nickcolley/jest-axe/pull/40)

Breaking changes:
- Update axe-core to 3.x - [(PR #39)](https://github.com/nickcolley/jest-axe/pull/39)

# 2.1.4

- Only publish index.js - [(PR #22)](https://github.com/nickcolley/jest-axe/pull/22)

# 2.1.3

- Loosen Node engines requirement to 8.x - [(PR #20)](https://github.com/nickcolley/jest-axe/pull/20)

# 2.1.2

- Allow Node.js versions higher than LTS to run jest-axe - [(PR #13)](https://github.com/nickcolley/jest-axe/pull/13) Thanks @connor-baer

# 2.1.1

- Fixed a bug with default options being mutated - [(Commit)](https://github.com/nickcolley/jest-axe/commit/60412a52461e610ab6d2391441edda0a803d0dc5)

# 2.1.0
(Made a mistake publishing, so is a minor version when should have been a patch)

- Nit: replaced 'var' with 'const' - [(PR #2)](https://github.com/nickcolley/jest-axe/pull/2) Thanks @JoshuaKGoldberg

# 2.0.0
Breaking changes:
- Fixed typo in matcher which will require you to update any tests that depend on this incorrect spelling.

# 1.0.0

Initial project

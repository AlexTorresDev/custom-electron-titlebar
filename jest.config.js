module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^base/(.*)$': '<rootDir>/src/base/$1',
    '^static/(.*)$': '<rootDir>/static/$1'
  },
  globals: {
    'ts-jest': {
      babelConfig: true,
    }
  },
};
import '@testing-library/jest-dom'

if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = (() =>
    Promise.reject(new Error('fetch is not mocked in this test'))) as unknown as typeof fetch
}

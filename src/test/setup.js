import '@testing-library/jest-dom/vitest'

// jsdom does not have IntersectionObserver (used by scroll animations), so we fake it.
globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

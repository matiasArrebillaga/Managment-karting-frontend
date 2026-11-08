// Matchers de Testing Library (toBeInTheDocument, toHaveTextContent, ...) para expect de Vitest
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// sin globals de Vitest, Testing Library no limpia solo el DOM entre tests
afterEach(() => {
    cleanup()
    localStorage.clear()
})

/**
 * Jest setup file for React Testing Library
 * This file ensures custom matchers and cleanup are configured globally.
 */

// Import custom matchers from jest-dom
import '@testing-library/jest-dom';



// Optional: Extend expect with jest-dom matchers
// This allows using matchers like toBeInTheDocument(), toHaveClass(), etc.

// React Testing Library automatically handles cleanup after each test,
// but if needed, you can enforce it explicitly:
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// If you need to mock global objects (like fetch), you can do it here:
// global.fetch = jest.fn();

// If using React Router, you can silence future warnings or configure mocks here.

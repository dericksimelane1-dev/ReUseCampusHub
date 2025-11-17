
/**
 * @file ItemList.test.js
 * Tests for ItemList component using React Testing Library.
 * Includes:
 * 1. Rendering search bar and item list.
 * 2. Image preview appears when file selected and disappears when cleared.
 * 3. Navigation button works using MemoryRouter.
 * Mocks: fetch, localStorage, jwtDecode, MapPicker.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ItemList from './ItemList';
import '@testing-library/jest-dom';

// ✅ Mock MapPicker to avoid Google Maps dependency
jest.mock('./MapPicker', () => () => <div data-testid="mock-map-picker"></div>);

// ✅ Mock jwtDecode to return a valid user
jest.mock('jwt-decode', () => ({
  jwtDecode: () => ({ id: 'testUser', interests: [] })
}));

beforeEach(() => {
  // ✅ Mock fetch for items
  global.fetch = jest.fn((url) => {
    if (url.includes('/api/items')) {
      return Promise.resolve({
        json: () => Promise.resolve([
          {
            id: '1',
            title: 'Laptop',
            description: 'Dell XPS',
            exchange_condition: 'Free',
            category: 'electronics',
            location: '{"lat":10,"lng":20}',
            poster_name: 'Alice',
            user_id: 'owner123',
            status: 'active'
          }
        ])
      });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });

  // ✅ Mock localStorage token
  Storage.prototype.getItem = jest.fn(() => 'mock.jwt.token');
});

afterEach(() => {
  jest.clearAllMocks();
});

test('renders search bar and item list', async () => {
  render(
    <MemoryRouter>
      <ItemList />
    </MemoryRouter>
  );

  expect(screen.getByPlaceholderText(/Search by keyword/i)).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText(/List of available Items/i)).toBeInTheDocument());
});

test('image preview appears when file selected and disappears when cleared', async () => {
  const { container } = render(
    <MemoryRouter>
      <ItemList />
    </MemoryRouter>
  );

  const fileInput = await waitFor(() => container.querySelector('input[type="file"]'));
  const file = new File(['dummy'], 'photo.png', { type: 'image/png' });

  fireEvent.change(fileInput, { target: { files: [file] } });

  await waitFor(() => {
    expect(container.querySelector('.image-preview')).toBeInTheDocument();
  });

  fireEvent.change(fileInput, { target: { files: [] } });

  await waitFor(() => {
    expect(container.querySelector('.image-preview')).not.toBeInTheDocument();
  });
});

test('Message Owner button exists and is clickable', async () => {
  render(
    <MemoryRouter>
      <ItemList />
    </MemoryRouter>
  );

  await waitFor(() => expect(screen.getByText(/Message Owner/i)).toBeInTheDocument());
  const button = screen.getByText(/Message Owner/i);
  fireEvent.click(button);
  expect(button).toBeEnabled();
});

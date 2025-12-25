
import { render, screen } from '@testing-library/react';
import App from './App';
import React from 'react';

// Mock react-router-dom to avoid issues with BrowserRouter
// We need to return proper components or strings, but avoid BrowserRouter logic that fails
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => <div>{children}</div>,
    Route: ({ element }) => <div>{element}</div>,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    NavLink: ({ children, to }) => <a href={to}>{children}</a>,
    useLocation: () => ({ pathname: '/' }),
    useNavigate: () => jest.fn(),
  };
});

test('renders app component', () => {
  render(<App />);
});

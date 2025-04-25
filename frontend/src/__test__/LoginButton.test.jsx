import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import useMediaQuery from '@mui/material/useMediaQuery';
import Login from '../Login';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock useMediaQuery
vi.mock('@mui/material/useMediaQuery', () => ({
  default: vi.fn(),
}));

describe('Login Button Component', () => {
  const defaultProps = {
    successJob: vi.fn(),
    showError: vi.fn(),
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMediaQuery).mockReturnValue(false); // Default: desktop view
  });

  // Test 1: Button renders correctly and displays "Login" when not loading
  it('renders button correctly and displays "Login" when not loading', () => {
    render(<Login {...defaultProps} />);
    const button = screen.getByRole('button', { name: /login/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Login');
    expect(button).not.toBeDisabled();
  });

  // Test 2: Clicking button with valid inputs triggers login
  it('triggers login when clicked with valid inputs', async () => {
    // Mock axios to return a successful response
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { token: 'mock-token' } });

    render(<Login {...defaultProps} />);
    const button = screen.getByRole('button', { name: /login/i });
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');

    // Simulate input and click
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(button);

    // Wait for loading state and verify
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(defaultProps.showError).not.toHaveBeenCalled();
    expect(defaultProps.successJob).toHaveBeenCalledWith('mock-token', 'test@example.com');
  });

  // Test 3: Clicking button without inputs triggers error
  it('triggers error when clicked without email or password', async () => {
    render(<Login {...defaultProps} />);
    const button = screen.getByRole('button', { name: /login/i });

    // Click without inputs
    fireEvent.click(button);

    // Verify error
    await waitFor(() => {
      expect(defaultProps.showError).toHaveBeenCalledWith('Please enter both email and password.');
    });
    expect(screen.getByRole('button', { name: /login/i })).toHaveTextContent('Login');
  });

  // Test 4: Button has correct width in mobile view
  it('applies correct width for mobile view', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true); // Simulate mobile view
    render(<Login {...defaultProps} />);
    const button = screen.getByRole('button', { name: /login/i });
    expect(button).toHaveStyle('width: 30vw');
  });

  // Test 5: Button has correct width in desktop view
  it('applies correct width for desktop view', () => {
    vi.mocked(useMediaQuery).mockReturnValue(false); // Simulate desktop view
    render(<Login {...defaultProps} />);
    const button = screen.getByRole('button', { name: /login/i });
    expect(button).toHaveStyle('width: 22.5vw');
  });

  // Test 6: Button does not trigger login when disabled
  it('does not trigger login when disabled', async () => {
    // Mock axios to simulate a pending request
    vi.mocked(axios.post).mockImplementation(() => new Promise(() => {}));

    render(<Login {...defaultProps} />);
    const button = screen.getByRole('button', { name: /login/i });
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');

    // Simulate input and click to enter loading state
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(button);

    // Wait for loading state
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
      },
      { timeout: 2000 }
    );

    // Click again while disabled
    fireEvent.click(screen.getByRole('button', { name: /logging in/i }));

    // Verify no additional error calls
    expect(defaultProps.showError).not.toHaveBeenCalled();
  });
});
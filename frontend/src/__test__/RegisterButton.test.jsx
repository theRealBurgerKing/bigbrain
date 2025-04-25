import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import useMediaQuery from '@mui/material/useMediaQuery';
import Register from '../Register1'; // Adjust path based on actual location

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock useMediaQuery
vi.mock('@mui/material/useMediaQuery', () => ({
  default: vi.fn(() => false), // Default: desktop view
}));

describe('Register Button Component', () => {
  const defaultProps = {
    successJob: vi.fn(),
    showError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMediaQuery).mockReturnValue(false); // Default: desktop view
    global.localStorage = {
      setItem: vi.fn(),
      getItem: vi.fn(),
      removeItem: vi.fn(),
    };
  });

  // Test 1: Button renders correctly with "Register" text
  it('renders the button with "Register" text', () => {
    render(<Register {...defaultProps} />);
    const button = screen.getByRole('button', { name: 'Register now' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Register');
    expect(button).not.toBeDisabled();
  });

  // Test 2: Button displays "Registering..." and is disabled when loading
  it('displays "Registering..." and is disabled when loading', async () => {
    // Mock axios to simulate a pending request
    vi.mocked(axios.post).mockImplementation(() => new Promise(() => {}));

    render(<Register {...defaultProps} />);
    const button = screen.getByRole('button', { name: 'Register now' });
    const emailInput = screen.getByLabelText('Email address');
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');

    // Simulate input and click
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(button);

    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Register now' })).toHaveTextContent('Registering...');
    });

    expect(button).toBeDisabled();
    expect(button).toHaveStyle('background-color: #a3bffa');
  });

  // Test 3: Clicking button with valid inputs triggers registration
  it('triggers registration when clicked with valid inputs', async () => {
    // Mock axios to return a successful response
    vi.mocked(axios.post).mockResolvedValue({ data: { token: 'mock-token' } });

    render(<Register {...defaultProps} />);
    const button = screen.getByRole('button', { name: 'Register now' });
    const emailInput = screen.getByLabelText('Email address');
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');

    // Simulate input and click
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(button);

    // Wait for loading state and verify
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Register now' })).toHaveTextContent('Registering...');
    });

    expect(defaultProps.showError).not.toHaveBeenCalled();
    expect(defaultProps.successJob).toHaveBeenCalledWith('mock-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('myemail', 'test@example.com');
  });

  // Test 4: Clicking button with missing inputs triggers error
  it('triggers error when clicked with missing inputs', async () => {
    render(<Register {...defaultProps} />);
    const button = screen.getByRole('button', { name: 'Register now' });

    // Click without inputs
    fireEvent.click(button);

    // Verify error
    await waitFor(() => {
      expect(defaultProps.showError).toHaveBeenCalledWith('Please fill in all fields.');
    });
    expect(screen.getByRole('button', { name: 'Register now' })).toHaveTextContent('Register');
  });

  // Test 5: Clicking button with mismatched passwords triggers error
  it('triggers error when passwords do not match', async () => {
    render(<Register {...defaultProps} />);
    const button = screen.getByRole('button', { name: 'Register now' });
    const emailInput = screen.getByLabelText('Email address');
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');

    // Simulate input with mismatched passwords
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    fireEvent.blur(confirmPasswordInput); // Trigger handleConfirmPasswordBlur
    fireEvent.click(button);

    // Verify error from handleConfirmPasswordBlur and register
    await waitFor(() => {
      expect(defaultProps.showError).toHaveBeenCalledWith('Passwords do not match.');
    });
    expect(screen.getByRole('button', { name: 'Register now' })).toHaveTextContent('Register');
  });

  

  // Test 6: Button has correct width in desktop view
  it('applies correct width for desktop view', () => {
    vi.mocked(useMediaQuery).mockReturnValue(false); // Simulate desktop view
    render(<Register {...defaultProps} />);
    const button = screen.getByRole('button', { name: 'Register now' });
    expect(button).toHaveStyle('width: 24vw');
  });

  // Test 7: Button does not trigger registration when disabled
  it('does not trigger registration when disabled', async () => {
    // Mock axios to simulate a pending request
    vi.mocked(axios.post).mockImplementation(() => new Promise(() => {}));

    render(<Register {...defaultProps} />);
    const button = screen.getByRole('button', { name: 'Register now' });
    const emailInput = screen.getByLabelText('Email address');
    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');

    // Simulate input and click to enter loading state
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(button);

    // Wait for loading state
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    // Click again while disabled
    fireEvent.click(button);

    // Verify no additional error calls
    expect(defaultProps.showError).not.toHaveBeenCalled();
  });
});
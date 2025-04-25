import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import useMediaQuery from '@mui/material/useMediaQuery';
import Pages from '../Pages'; // Adjust path as needed

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

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' }), // Default to non-play route
  };
});

// Mock child components
vi.mock('../Register1', () => ({
  default: () => <div>Register</div>,
}));
vi.mock('../Login', () => ({
  default: () => <div>Login</div>,
}));
vi.mock('../Dashboard', () => ({
  default: () => <div>Dashboard</div>,
}));
vi.mock('../ErrorModal', () => ({
  default: ({ open, onClose, message }) => (
    open ? <div data-testid="error-modal">{message}</div> : null
  ),
}));
vi.mock('../GameEditor', () => ({
  default: () => <div>GameEditor</div>,
}));
vi.mock('../QuestionEditor', () => ({
  default: () => <div>QuestionEditor</div>,
}));
vi.mock('../GameSession', () => ({
  default: () => <div>GameSession</div>,
}));
vi.mock('../PlayGround', () => ({
  default: () => <div>PlayGround</div>,
}));
vi.mock('../NavigateToPlay', () => ({
  default: () => <div>NavigateToPlay</div>,
}));
vi.mock('../OldSession', () => ({
  default: () => <div>OldSession</div>,
}));
vi.mock('../Index', () => ({
  default: () => <div>Index</div>,
}));

describe('Logout Button Component', () => {
  const mockToken = 'mock-token';
  const mockEmail = 'test@example.com';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMediaQuery).mockReturnValue(false); // Default: desktop view
    global.localStorage = {
      getItem: vi.fn((key) => (key === 'token' ? mockToken : key === 'myemail' ? mockEmail : null)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
  });

  // Test 1: Button renders correctly with "Logout" text when token exists
  it('renders the button with "Logout" text when token exists', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Pages />
      </MemoryRouter>
    );
    const button = screen.getByRole('button', { name: /logout/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Logout');
    expect(button).not.toBeDisabled();
  });

  // Test 2: Button displays "Logging out..." and is disabled when loading
  it('displays "Logging out..." and is disabled when loading', async () => {
    // Mock axios to simulate a pending request
    vi.mocked(axios.post).mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Pages />
      </MemoryRouter>
    );
    const button = screen.getByRole('button', { name: /logout/i });

    // Simulate click
    fireEvent.click(button);

    // Wait for loading state
    await waitFor(() => {
      expect(button).toHaveTextContent('Logging out...');
    });

    expect(button).toBeDisabled();
    expect(button).toHaveStyle('background-color: #a3bffa');
  });

  // Test 3: Clicking button with valid token triggers logout
  it('triggers logout when clicked with valid token', async () => {
    // Mock axios to return a successful response
    vi.mocked(axios.post).mockResolvedValue({ status: 200 });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Pages />
      </MemoryRouter>
    );
    const button = screen.getByRole('button', { name: /logout/i });

    // Simulate click
    fireEvent.click(button);

    // Wait for loading state and verify
    await waitFor(() => {
      expect(button).toHaveTextContent('Logging out...');
    });

    // Verify logout actions
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:5005/admin/auth/logout',
      {},
      { headers: { Authorization: `Bearer ${mockToken}` } }
    );
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('myemail');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  // Test 4: Renders Register and Login links when no token exists
  it('renders Register and Login links when no token exists', () => {
    // Mock localStorage to return no token
    global.localStorage.getItem.mockReturnValue(null);

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Pages />
      </MemoryRouter>
    );

    // Verify Logout button is not rendered
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();

    // Verify Register and Login links are rendered
    const registerLink = screen.getByRole('link', { name: 'Navigate to register page' });
    const loginLink = screen.getByRole('link', { name: 'Navigate to login page' });
    expect(registerLink).toBeInTheDocument();
    expect(loginLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  // Test 5: Button has correct padding in mobile view
  it('applies correct padding for mobile view', async () => {
    vi.mocked(useMediaQuery).mockReturnValue(true); // Simulate mobile view
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Pages />
      </MemoryRouter>
    );
    const button = screen.getByRole('button', { name: /logout/i });

    // Debug: Log computed styles
    console.log('isMobile:', vi.mocked(useMediaQuery).mock.results[0].value);
    console.log('Computed padding:', getComputedStyle(button).padding);

    // Wait for potential style application
    await waitFor(() => {
      expect(button).toHaveStyle('padding: 1.5vh 4vw');
    }, { timeout: 1000 });
  });

  // Test 6: Button has correct padding in desktop view
  it('applies correct padding for desktop view', async () => {
    vi.mocked(useMediaQuery).mockReturnValue(false); // Simulate desktop view
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Pages />
      </MemoryRouter>
    );
    const button = screen.getByRole('button', { name: /logout/i });

    // Wait for potential style application
    await waitFor(() => {
      expect(button).toHaveStyle('padding: 1vh 2vw');
    }, { timeout: 1000 });
  });

  // Test 7: Button does not trigger logout when disabled
  it('does not trigger logout when disabled', async () => {
    // Mock axios to simulate a pending request
    vi.mocked(axios.post).mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Pages />
      </MemoryRouter>
    );
    const button = screen.getByRole('button', { name: /logout/i });

    // Simulate click to enter loading state
    fireEvent.click(button);

    // Wait for loading state
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    // Click again while disabled
    fireEvent.click(button);

    // Verify no additional axios calls
    expect(axios.post).toHaveBeenCalledTimes(1);
  });
});
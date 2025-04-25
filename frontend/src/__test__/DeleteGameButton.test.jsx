import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import useMediaQuery from '@mui/material/useMediaQuery';
import Dashboard from '../Dashboard';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
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
  };
});

// Mock Modal component
vi.mock('../Modal', () => ({
  default: ({ children, onClose }) => (
    <div data-testid="modal">
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('Delete Game Button Component', () => {
  // Mock localStorage
  const mockToken = 'mock-token';
  const mockEmail = 'test@example.com';
  const mockGame = {
    gameId: 1,
    name: 'Test Game',
    owner: mockEmail,
    createdAt: new Date().toISOString(),
    questions: [],
    active: false,
    oldSessions: [],
    thumbnail: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMediaQuery).mockReturnValue(false); // Default: desktop view
    vi.mocked(axios.get).mockResolvedValue({
      status: 200,
      data: { games: [{ id: mockGame.gameId, name: mockGame.name, owner: mockGame.owner, createdAt: mockGame.createdAt, questions: mockGame.questions, active: mockGame.active, oldSessions: mockGame.oldSessions, thumbnail: mockGame.thumbnail }] },
    });
    global.localStorage = {
      getItem: vi.fn((key) => (key === 'token' ? mockToken : key === 'myemail' ? mockEmail : null)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
  });

  // Test 1: Button renders correctly with "Delete Game" text
  it('renders the button with "Delete Game" text', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for fetchGames to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: `Delete game ${mockGame.name}` });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Delete Game');
    expect(button).not.toBeDisabled();
  });

  // Test 2: Clicking button opens the delete confirmation modal
  it('opens delete confirmation modal when clicked', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for fetchGames to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: `Delete game ${mockGame.name}` });

    // Simulate click
    fireEvent.click(button);

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to delete this game?')).toBeInTheDocument();
    });
  });

  // Test 3: Button is disabled when game is active
  it('is disabled when game is active', async () => {
    vi.mocked(axios.get).mockResolvedValue({
      status: 200,
      data: { games: [{ ...mockGame, active: true }] },
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for fetchGames to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: `Delete game ${mockGame.name}` });
    expect(button).toBeDisabled();
    expect(button).toHaveStyle('background-color: #a3bffa');
  });

  // Test 4: Button has correct width in mobile view
  it('applies correct width for mobile view', async () => {
    vi.mocked(useMediaQuery).mockReturnValue(true); // Simulate mobile view
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for fetchGames to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: `Delete game ${mockGame.name}` });
    expect(button).toHaveStyle('width: 24vw');
  });

  // Test 5: Button has correct width in desktop view
  it('applies correct width for desktop view', async () => {
    vi.mocked(useMediaQuery).mockReturnValue(false); // Simulate desktop view
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for fetchGames to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: `Delete game ${mockGame.name}` });
    expect(button).toHaveStyle('width: 9vw');
  });

  

    const button = screen.getByRole('button', { name: `Delete game ${mockGame.name}` });

    // Click button while disabled
    fireEvent.click(button);

    // Verify modal does not appear
    expect(screen.queryByText('Are you sure you want to delete this game?')).not.toBeInTheDocument();
  });
});
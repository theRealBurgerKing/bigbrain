import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useParams } from 'react-router-dom';
import axios from 'axios';
import useMediaQuery from '@mui/material/useMediaQuery';
import GameEditor from '../GameEditor';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
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
    useParams: vi.fn(),
  };
});

describe('Back to Dashboard Button Component', () => {
  const mockToken = 'mock-token';
  const mockGameId = '1';
  const mockGame = {
    gameId: Number(mockGameId),
    name: 'Test Game',
    owner: 'test@example.com',
    createdAt: new Date().toISOString(),
    questions: [],
    active: false,
    thumbnail: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMediaQuery).mockReturnValue(false); // Default: desktop view
    vi.mocked(useParams).mockReturnValue({ gameId: mockGameId });
    vi.mocked(axios.get).mockResolvedValue({
      status: 200,
      data: {
        games: [{
          id: mockGame.gameId,
          name: mockGame.name,
          owner: mockGame.owner,
          createdAt: mockGame.createdAt,
          questions: mockGame.questions,
          active: mockGame.active,
          thumbnail: mockGame.thumbnail,
        }],
      },
    });
    global.localStorage = {
      getItem: vi.fn((key) => (key === 'token' ? mockToken : null)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
  });

  // Test 1: Button renders correctly with "Back to Dashboard" text
  it('renders the button with "Back to Dashboard" text', async () => {
    render(
      <MemoryRouter initialEntries={[`/game/${mockGameId}`]}>
        <GameEditor />
      </MemoryRouter>
    );

    // Wait for game data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: 'Return to dashboard' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Back to Dashboard');
    expect(button).not.toBeDisabled();
  });

  // Test 2: Clicking button navigates to dashboard
  it('navigates to dashboard when clicked', async () => {
    render(
      <MemoryRouter initialEntries={[`/game/${mockGameId}`]}>
        <GameEditor />
      </MemoryRouter>
    );

    // Wait for game data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: 'Return to dashboard' });

    // Simulate click
    fireEvent.click(button);

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });


  // Test 3: Button has correct padding in mobile view
  it('applies correct padding for mobile view', async () => {
    vi.mocked(useMediaQuery).mockReturnValue(true); // Simulate mobile view
    render(
      <MemoryRouter initialEntries={[`/game/${mockGameId}`]}>
        <GameEditor />
      </MemoryRouter>
    );

    // Wait for game data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: 'Return to dashboard' });

    // Debug: Log computed styles
    console.log('isMobile:', vi.mocked(useMediaQuery).mock.results[0].value);
    console.log('Computed padding:', getComputedStyle(button).padding);

    // Wait for potential style application
    await waitFor(() => {
      expect(button).toHaveStyle('padding: 1.5vh 3vw');
    }, { timeout: 1000 });
  });

  // Test 4: Button has correct padding in desktop view
  it('applies correct padding for desktop view', async () => {
    vi.mocked(useMediaQuery).mockReturnValue(false); // Simulate desktop view
    render(
      <MemoryRouter initialEntries={[`/game/${mockGameId}`]}>
        <GameEditor />
      </MemoryRouter>
    );

    // Wait for game data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: 'Return to dashboard' });

    // Wait for potential style application
    await waitFor(() => {
      expect(button).toHaveStyle('padding: 1vh 2vw');
    }, { timeout: 1000 });
  });

  // Test 5: Button has correct aria-label for accessibility
  it('has correct aria-label for accessibility', async () => {
    render(
      <MemoryRouter initialEntries={[`/game/${mockGameId}`]}>
        <GameEditor />
      </MemoryRouter>
    );

    // Wait for game data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: 'Return to dashboard' });
    expect(button).toHaveAttribute('aria-label', 'Return to dashboard');
  });


});
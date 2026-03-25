import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../SearchBar';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input with correct placeholder', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText('🔍 搜索文档...')).toBeInTheDocument();
  });

  it('should update query on input change', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('🔍 搜索文档...') as HTMLInputElement;
    await userEvent.type(input, 'hello');
    expect(input.value).toBe('hello');
  });

  it('should not call fetch for empty query', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('🔍 搜索文档...') as HTMLInputElement;
    await userEvent.clear(input);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should call fetch API with encoded query param', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('🔍 搜索文档...');
    await userEvent.type(input, 'x');
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('q=x'),
        expect.any(Object),
      );
    });
  });
});

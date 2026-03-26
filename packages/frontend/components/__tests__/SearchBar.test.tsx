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

  it('should clear results and hide dropdown when query is empty string', async () => {
    // Pre-populate with a result from previous search
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, title: 'Doc A', createdAt: '2024-01-01', updatedAt: '2024-01-01' }],
    });
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('🔍 搜索文档...') as HTMLInputElement;
    await userEvent.type(input, 'x');
    // Wait for results to appear
    await waitFor(() => expect(screen.getByText('Doc A')).toBeInTheDocument());
    // Now clear — triggers the empty-string branch
    await userEvent.clear(input);
    await waitFor(() => {
      expect(screen.queryByText('Doc A')).not.toBeInTheDocument();
    });
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

  it('should display dropdown with results when API returns data', async () => {
    const mockResults = [
      { id: 1, title: 'Doc A', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: 2, title: 'Doc B', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
    ];
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockResults });
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('🔍 搜索文档...');
    await userEvent.type(input, 'doc');
    await waitFor(() => {
      expect(screen.getByText('Doc A')).toBeInTheDocument();
      expect(screen.getByText('Doc B')).toBeInTheDocument();
    });
  });

  it('should navigate to correct document path on result click', async () => {
    const mockResults = [
      { id: 42, title: 'Target Doc', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    ];
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockResults });
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('🔍 搜索文档...');
    await userEvent.type(input, 'target');
    await waitFor(() => screen.getByText('Target Doc'));
    await userEvent.click(screen.getByText('Target Doc'));
    expect(mockPush).toHaveBeenCalledWith('/home/cloud-docs/42');
  });

  it('should URL-encode special characters in query', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => [] });
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('🔍 搜索文档...');
    await userEvent.type(input, 'hello world');
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('hello%20world'),
        expect.any(Object),
      );
    });
  });

  it('should not navigate when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('network error'));
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('🔍 搜索文档...');
    await userEvent.type(input, 'fail');
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});

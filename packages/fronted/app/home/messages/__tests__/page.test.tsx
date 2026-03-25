import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessagesPage from '../page';

describe('MessagesPage', () => {
  it('should render placeholder UI', () => {
    render(<MessagesPage />);
    expect(screen.getByText('消息中心')).toBeInTheDocument();
    expect(screen.getByText('协作通知和评论功能开发中，敬请期待')).toBeInTheDocument();
  });

  it('should render emoji', () => {
    render(<MessagesPage />);
    expect(screen.getByText('💬')).toBeInTheDocument();
  });
});

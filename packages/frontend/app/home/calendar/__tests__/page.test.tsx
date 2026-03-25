import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CalendarPage from '../page';

describe('CalendarPage', () => {
  it('should render placeholder UI', () => {
    render(<CalendarPage />);
    expect(screen.getByText('日历')).toBeInTheDocument();
    expect(screen.getByText('文档截止日期和日程功能开发中，敬请期待')).toBeInTheDocument();
  });

  it('should render emoji', () => {
    render(<CalendarPage />);
    expect(screen.getByText('📅')).toBeInTheDocument();
  });
});

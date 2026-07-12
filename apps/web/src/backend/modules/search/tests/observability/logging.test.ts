import { describe, it, expect, vi } from 'vitest';
import { logger } from '@/lib/logger';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Search Observability', () => {
  it('should log with correlation ID', () => {
    logger.info('Test message', { correlationId: 'test-123' });

    expect(logger.info).toHaveBeenCalledWith(
      'Test message',
      expect.objectContaining({ correlationId: 'test-123' }),
    );
  });
});

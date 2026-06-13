import { describe, it, expect, vi } from 'vitest';
import { PartsRepository } from '../domain/parts.repository';

// Mock Implementation
class MockPartsRepository implements PartsRepository {
  async getPartById(id: string) {
    if (id === 'existing-id') {
      return { id: 'existing-id', title: 'Test Part' } as any;
    }
    return null;
  }
  async getSellerByUserId(userId: string) {
    return { id: userId, business_name: 'Test Seller' } as any;
  }
}

describe('PartsRepository', () => {
  it('should return a part when it exists', async () => {
    const repo = new MockPartsRepository();
    const part = await repo.getPartById('existing-id');
    expect(part).not.toBeNull();
    expect(part?.id).toBe('existing-id');
  });

  it('should return null when a part does not exist', async () => {
    const repo = new MockPartsRepository();
    const part = await repo.getPartById('non-existent-id');
    expect(part).toBeNull();
  });
});

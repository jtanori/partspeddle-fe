import { describe, it, expect } from 'vitest';
import { analyzeListingImage } from '../../application';

describe('AI module contract', () => {
  it('exports the analyzeListingImage use case', () => {
    expect(analyzeListingImage).toBeInstanceOf(Function);
  });
});

import { describe, it, expect } from 'vitest';
import { securityHeaderEntries, buildContentSecurityPolicy } from '@/lib/security-headers';
import { validateFile } from '@/lib/upload-validation';
import fs from 'fs';
import path from 'path';
import { createAuthSlice } from '@/store/slices/authSlice';

function* walk(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      yield fullPath;
    }
  }
}

describe('P5.6 frontend and client-side security', () => {
  it('static headers do not include Content-Security-Policy', () => {
    const keys = securityHeaderEntries().map((h) => h.key);
    expect(keys).not.toContain('Content-Security-Policy');
  });

  it('nonce-aware production csp does not allow unsafe-inline or unsafe-eval in script-src', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const csp = buildContentSecurityPolicy('dGVzdC1ub25jZQ==');
    const scriptSrc = csp.match(/script-src[^;]+/)?.[0] ?? '';
    expect(scriptSrc).toContain("'nonce-dGVzdC1ub25jZQ=='");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    process.env.NODE_ENV = originalEnv;
  });

  it('fallback csp allows unsafe-inline in script-src when no nonce is provided', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const csp = buildContentSecurityPolicy();
    const scriptSrc = csp.match(/script-src[^;]+/)?.[0] ?? '';
    expect(scriptSrc).toBe("script-src 'self' 'unsafe-inline'");
    process.env.NODE_ENV = originalEnv;
  });

  it('has no dangerouslySetInnerHTML usage in source', () => {
    const offenders: string[] = [];
    for (const filePath of walk(path.resolve(process.cwd(), 'src'))) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('dangerouslySetInnerHTML')) {
        offenders.push(path.relative(process.cwd(), filePath));
      }
    }
    expect(offenders).toEqual([]);
  });

  it('upload validation rejects invalid mime type', () => {
    const file = new File(['x'], 'test.txt', { type: 'text/plain' });
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file type');
  });

  it('upload validation rejects oversized file', () => {
    const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 25 * 1024 * 1024 });
    const result = validateFile(file, { maxSizeBytes: 20 * 1024 * 1024 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too large');
  });

  it('auth slice does not reference role localStorage key', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'apps/web/src/store/slices/authSlice.ts'),
      'utf-8',
    );
    expect(source).not.toContain('parts_peddle_user_role');
  });

  it('auth slice initializes role as buyer', () => {
    const slice = createAuthSlice(() => {}, {} as any, {} as any);
    expect(slice.userRole).toBe('buyer');
  });
});

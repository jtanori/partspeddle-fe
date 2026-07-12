import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P6.4 replace service-role usage in public and analytics routes', () => {
  it('public homepage does not import supabaseAdmin', () => {
    const page = read('src/app/(public)/page.tsx');
    expect(page).not.toContain('@/lib/supabase-admin');
    expect(page).not.toContain('supabaseAdmin');
    expect(page).toContain('createAnonServerClient');
  });

  it('public listing page does not import supabaseAdmin', () => {
    const page = read('src/app/(public)/listing/[id]/page.tsx');
    expect(page).not.toContain('@/lib/supabase-admin');
    expect(page).not.toContain('supabaseAdmin');
    expect(page).toContain('createAnonServerClient');
  });

  it('public API routes do not import supabaseAdmin', () => {
    const routes = [
      'src/app/api/parts/featured/route.ts',
      'src/app/api/sellers/top/route.ts',
      'src/app/api/taxonomy/route.ts',
      'src/app/api/search/clicks/route.ts',
      'src/app/api/search/events/route.ts',
    ];
    for (const route of routes) {
      const content = read(route);
      expect(content).not.toContain('@/lib/supabase-admin');
      expect(content).not.toContain('supabaseAdmin');
      expect(
        content.includes('createAnonServerClient') || content.includes("createRepositories('public')"),
      ).toBe(true);
    }
  });

  it('analytics events route no longer accepts client-controlled user/session IDs', () => {
    const route = read('src/app/api/search/events/route.ts');
    expect(route).not.toContain('userId');
    expect(route).not.toContain('sessionId');
    expect(route).not.toContain('user_id:');
    expect(route).not.toContain('session_id:');
  });
});

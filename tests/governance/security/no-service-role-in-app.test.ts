import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const APP_DIR = path.resolve(PROJECT_ROOT, 'apps/web/src/app');
const COMPONENTS_DIR = path.resolve(PROJECT_ROOT, 'apps/web/src/components');

// API routes that are allowed to use the service-role client because they
// execute RPCs, storage uploads, or admin batch operations. These must be
// documented in docs/engineering/data-access.md.
const DOCUMENTED_EXCEPTIONS = new Set([
  'apps/web/src/app/api/seller/assets/upload/route.ts',
  'apps/web/src/app/api/seller/upload-logo/route.ts',
  'apps/web/src/app/api/seller/inventory/commit/route.ts',
  'apps/web/src/app/api/seller/drafts/[id]/publish/route.ts',
  'apps/web/src/app/api/admin/search/reindex/route.ts',
  'apps/web/src/app/api/admin/search/reindex/[partId]/route.ts',
  'apps/web/src/app/api/seller/profile/route.ts',
]);

function* walk(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      yield fullPath;
    }
  }
}

function relativeToProject(filePath: string): string {
  return path.relative(PROJECT_ROOT, filePath);
}

function isDocumentedException(relativePath: string): boolean {
  // Normalize path separators for cross-platform matching.
  const normalized = relativePath.split(path.sep).join('/');
  return DOCUMENTED_EXCEPTIONS.has(normalized);
}

describe('P5.4 repository and data-access security', () => {
  it('has no undocumented supabaseAdmin imports in src/app/', () => {
    const offenders: string[] = [];
    for (const filePath of walk(APP_DIR)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (
        content.includes('@/lib/supabase-admin') &&
        !isDocumentedException(relativeToProject(filePath))
      ) {
        offenders.push(relativeToProject(filePath));
      }
    }
    expect(offenders).toEqual([]);
  });

  it('has no supabaseAdmin imports in src/components/', () => {
    if (!fs.existsSync(COMPONENTS_DIR)) {
      return;
    }
    const offenders: string[] = [];
    for (const filePath of walk(COMPONENTS_DIR)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('@/lib/supabase-admin')) {
        offenders.push(relativeToProject(filePath));
      }
    }
    expect(offenders).toEqual([]);
  });

});

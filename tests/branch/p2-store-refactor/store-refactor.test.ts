import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.resolve(__dirname, '../../../', relativePath));
}

describe('P2.7 global store refactor', () => {
  it('splits the monolithic store into focused slices', () => {
    expect(fileExists('src/store/slices/authSlice.ts')).toBe(true);
    expect(fileExists('src/store/slices/cartSlice.ts')).toBe(true);
    expect(fileExists('src/store/slices/searchSlice.ts')).toBe(true);
    expect(fileExists('src/store/slices/sellerNavSlice.ts')).toBe(true);
    expect(fileExists('src/store/slices/uiSlice.ts')).toBe(true);

    const rootStore = read('src/store/useAppStore.ts');
    expect(rootStore).toContain('createAuthSlice');
    expect(rootStore).toContain('createCartSlice');
    expect(rootStore).not.toContain('localStorage.getItem');
  });

  it('exposes focused selector hooks for each domain', () => {
    const hooks = read('src/store/hooks.ts');
    expect(hooks).toContain('useAuthStore');
    expect(hooks).toContain('useCartStore');
    expect(hooks).toContain('useSearchStore');
    expect(hooks).toContain('useSellerNavStore');
    expect(hooks).toContain('useUiStore');
    expect(hooks).toContain('useShallow');
  });

  it('migrates presentation components to focused store hooks', () => {
    const authProvider = read('src/components/providers/AuthProvider.tsx');
    const pdp = read('src/components/pdp-modern/PDPRoot.tsx');
    const overlays = read('src/components/UIOverlays.tsx');
    const sellerLayout = read('src/app/(seller)/layout.tsx');

    expect(authProvider).toContain('useAuthStore');
    expect(authProvider).not.toContain('useAppStore');

    expect(pdp).toContain('useCartStore');
    expect(pdp).not.toContain('useAppStore');

    expect(overlays).toContain('useCartStore');
    expect(overlays).toContain('useUiStore');
    expect(overlays).toContain('useSearchStore');
    expect(overlays).not.toContain('useAppStore');

    expect(sellerLayout).toContain('useAuthStore');
    expect(sellerLayout).not.toContain('useAppStore');
  });

  it('keeps auth logout in the auth slice only', () => {
    const authSlice = read('src/store/slices/authSlice.ts');
    const cartSlice = read('src/store/slices/cartSlice.ts');

    expect(authSlice).toContain('logout');
    expect(authSlice).toContain('supabase.auth.signOut');
    expect(cartSlice).not.toContain('supabase');
  });

  it('persists cart state through shared storage helpers', () => {
    const storage = read('src/store/storage.ts');
    const cartSlice = read('src/store/slices/cartSlice.ts');

    expect(storage).toContain('safeGetItem');
    expect(storage).toContain('safeSetItem');
    expect(cartSlice).toContain('parts_peddle_cart');
    expect(cartSlice).toContain('safeSetItem');
  });
});
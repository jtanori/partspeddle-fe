import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P1.7 mobile viewport, video tutorial, and focus artifacts', () => {
  it('exports an explicit viewport from layout.tsx', () => {
    const layout = read('apps/web/src/app/layout.tsx');
    expect(layout).toContain('export const viewport');
    expect(layout).toContain("width: 'device-width'");
    expect(layout).toContain('initialScale: 1');
    expect(layout).toContain('maximumScale: 5');
  });

  it('mounts GuidedTour only in UIOverlays, not PublicShell', () => {
    const publicShell = read('apps/web/src/components/layout/PublicShell.tsx');
    const uiOverlays = read('apps/web/src/components/UIOverlays.tsx');
    expect(uiOverlays).toContain('<GuidedTour');
    expect(publicShell).not.toContain('<GuidedTour');
  });

  it('uses a CSS class for tour highlight cleanup instead of inline styles', () => {
    const tour = read('apps/web/src/components/GuidedTour.tsx');
    expect(tour).toContain('.tour-highlight');
    expect(tour).toContain("el.classList.add('tour-highlight')");
    expect(tour).toContain("el.classList.remove('tour-highlight')");
    expect(tour).not.toContain('el.style.boxShadow =');
  });

  it('makes the GuidedTour dialog responsive for mobile', () => {
    const tour = read('apps/web/src/components/GuidedTour.tsx');
    expect(tour).toContain('sm:max-w-[720px]');
    expect(tour).toContain('sm:aspect-[16/10]');
    expect(tour).toContain('aspect-video');
    expect(tour).toContain('sm:p-4');
  });

  it('hides the global help button while the tour is active and raises it on mobile', () => {
    const overlays = read('apps/web/src/components/UIOverlays.tsx');
    expect(overlays).toContain('!isTourActive');
    expect(overlays).toContain('bottom-24');
    expect(overlays).toContain('sm:bottom-8');
  });
});

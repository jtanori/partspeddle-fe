import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P1.10 seller dashboard mobile adaptation', () => {
  it('hides the seller sidebar on mobile and shows it on md+', () => {
    const sidebar = read('src/components/workspace/Sidebar.tsx');
    const layout = read('src/app/(seller)/layout.tsx');
    expect(sidebar).toContain('hidden');
    expect(sidebar).toContain('md:flex');
    expect(layout).toContain('isMobileSidebarOpen');
  });

  it('adds a mobile menu toggle to the seller dashboard header', () => {
    const header = read('src/components/seller-dashboard/DashboardHeader.tsx');
    expect(header).toContain('onToggleMobileMenu');
    expect(header).toContain('<Menu className');
    expect(header).toContain('md:hidden');
  });

  it('supports closing the mobile sidebar after navigation', () => {
    const sidebar = read('src/components/seller-dashboard/Sidebar.tsx');
    expect(sidebar).toContain('onNavigate');
    expect(sidebar).toContain('showCloseButton');
  });

  it('uses tap-to-toggle help popover constrained to the viewport', () => {
    const stage = read('src/components/wizard/stages/StageOneMedia.tsx');
    expect(stage).toContain('onClick={() => setActivePopover');
    expect(stage).not.toContain('onMouseEnter');
    expect(stage).toContain('max-w-[calc(100vw-2rem)]');
  });

  it('uses responsive padding in seller inventory and settings views', () => {
    const inventory = read('src/components/seller-dashboard/InventoryTable.tsx');
    const settings = read('src/components/seller-dashboard/SettingsForm.tsx');
    expect(inventory).toContain('p-4 sm:p-6 md:p-8');
    expect(settings).toContain('p-4 sm:p-6 md:p-10');
  });

  it('prevents horizontal overflow in the seller workspace', () => {
    const workspaceLayout = read('src/components/workspace/workspace-layout.tsx');
    expect(workspaceLayout).toContain('overflow-x-hidden');
    expect(workspaceLayout).toContain('min-w-0');
  });
});
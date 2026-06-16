import fs from 'node:fs';
import path from 'node:path';
import { CompiledSemanticArtifact } from './types';

export class SnapshotStore {
  constructor(private basePath: string) {}

  private pathFor(a: CompiledSemanticArtifact) {
    return path.join(this.basePath, a.categoryId, a.listingId, `${a.version}.json`);
  }

  async save(a: CompiledSemanticArtifact) {
    const p = this.pathFor(a);
    await fs.promises.mkdir(path.dirname(p), { recursive: true });
    await fs.promises.writeFile(p, JSON.stringify(a, null, 2));
  }

  async loadPrevious(input: {
    listingId: string;
    categoryId: string;
  }): Promise<CompiledSemanticArtifact | null> {
    const dir = path.join(this.basePath, input.categoryId, input.listingId);
    if (!fs.existsSync(dir)) return null;

    const versions = await fs.promises.readdir(dir);
    if (!versions.length) return null;

    const latest = versions.sort().at(-1)!;
    const content = await fs.promises.readFile(path.join(dir, latest), "utf-8");
    return JSON.parse(content);
  }
}

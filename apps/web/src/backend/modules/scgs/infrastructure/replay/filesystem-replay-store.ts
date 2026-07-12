import fs from 'node:fs';
import path from 'node:path';
import type { ReplayStore, ReplayStoreListOptions } from '../../domain/replay/replay-store.port';
import type { SemanticReplayTrace } from '../../domain/replay/types';

export class FilesystemReplayStore implements ReplayStore {
  constructor(private basePath: string = 'governance/scgs/replay') {}

  private traceDir(): string {
    return path.join(this.basePath, 'traces');
  }

  private tracePath(traceId: string): string {
    return path.join(this.traceDir(), `${traceId}.json`);
  }

  async save(trace: SemanticReplayTrace): Promise<void> {
    const dir = this.traceDir();
    await fs.promises.mkdir(dir, { recursive: true });

    await fs.promises.writeFile(this.tracePath(trace.traceId), JSON.stringify(trace, null, 2));

    const eventStream = trace.events.map((e) => JSON.stringify(e)).join('\n');
    await fs.promises.writeFile(path.join(dir, `${trace.traceId}.events.jsonl`), eventStream);
  }

  async load(traceId: string): Promise<SemanticReplayTrace | null> {
    const filePath = this.tracePath(traceId);
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(content) as SemanticReplayTrace;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw err;
    }
  }

  async list(options: ReplayStoreListOptions = {}): Promise<SemanticReplayTrace[]> {
    const dir = this.traceDir();
    try {
      const entries = await fs.promises.readdir(dir);
      const traces: SemanticReplayTrace[] = [];

      for (const entry of entries) {
        if (!entry.endsWith('.json') || entry.endsWith('.events.jsonl')) {
          continue;
        }
        const traceId = entry.replace(/\.json$/, '');
        const trace = await this.load(traceId);
        if (!trace) continue;

        if (options.listingId && trace.listingId !== options.listingId) continue;
        if (options.categoryId && trace.categoryId !== options.categoryId) continue;
        if (options.environment && trace.metadata.environment !== options.environment) continue;
        if (options.before && trace.metadata.createdAt >= options.before) continue;

        traces.push(trace);
      }

      traces.sort((a, b) => b.metadata.createdAt.localeCompare(a.metadata.createdAt));
      const limit = options.limit ?? traces.length;
      return traces.slice(0, limit);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw err;
    }
  }
}

import fs from 'node:fs';
import path from 'node:path';
import { SemanticReplayTrace } from './types';

export class ReplayStore {
  constructor(private basePath: string = '.scgs/replay') {}

  async saveTrace(trace: SemanticReplayTrace) {
    const traceDir = path.join(this.basePath, 'traces');
    await fs.promises.mkdir(traceDir, { recursive: true });
    
    // Save full bundle
    await fs.promises.writeFile(
      path.join(traceDir, `${trace.traceId}.json`),
      JSON.stringify(trace, null, 2)
    );

    // Save event stream (JSONL)
    const eventStream = trace.events.map(e => JSON.stringify(e)).join('\n');
    await fs.promises.writeFile(
      path.join(traceDir, `${trace.traceId}.events.jsonl`),
      eventStream
    );
  }

  async loadTrace(traceId: string): Promise<SemanticReplayTrace> {
    const content = await fs.promises.readFile(
      path.join(this.basePath, 'traces', `${traceId}.json`),
      'utf-8'
    );
    return JSON.parse(content);
  }
}

export type PRRCheckStatus = 'PASS' | 'WARN' | 'BLOCK';

export interface PRRCheck {
  name: string;
  status: PRRCheckStatus;
  reasonCodes: string[];
  durationMs: number;
}

export interface PRRReport {
  status: PRRCheckStatus;
  checks: PRRCheck[];
  summary: {
    pass: number;
    warn: number;
    block: number;
    total: number;
  };
  generatedAt: string;
  gitCommit?: string;
  environment?: string;
}

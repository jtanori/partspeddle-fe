import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readFunction(fileName: string): string {
  return fs.readFileSync(
    path.resolve(
      __dirname,
      '../../../supabase/functions',
      fileName,
      'index.ts',
    ),
    'utf-8',
  );
}

describe('P1.4 Edge Function hardening', () => {
  describe('sync-algolia-webhook', () => {
    const source = readFunction('sync-algolia-webhook');

    it('reads a webhook secret from environment', () => {
      expect(source).toContain('SUPABASE_WEBHOOK_SECRET');
    });

    it('verifies the x-webhook-signature header before processing', () => {
      expect(source).toContain('x-webhook-signature');
      expect(source).toMatch(/verifyWebhookSignature\s*\(/);
    });

    it('returns 401 when the signature is missing or invalid', () => {
      expect(source).toContain('Invalid or missing webhook signature');
      expect(source).toContain('status: 401');
    });

    it('uses constant-time HMAC comparison to prevent timing attacks', () => {
      expect(source).toContain('HMAC');
      expect(source).toContain('charCodeAt(i) ^');
    });

    it('does not send secrets in HTTP responses', () => {
      const responseSection = source.split('function unauthorized')[1] ?? '';
      expect(responseSection).not.toContain('ALGOLIA_ADMIN_KEY');
      expect(responseSection).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
    });
  });

  describe('analyze-part-image', () => {
    const source = readFunction('analyze-part-image');

    it('sends the Gemini API key in a header instead of the URL', () => {
      expect(source).toContain('x-goog-api-key');
      expect(source).not.toMatch(/generateContent\?key=/);
    });

    it('validates image MIME types', () => {
      expect(source).toContain('ALLOWED_MIME_TYPES');
      expect(source).toContain('Tipo de archivo no soportado');
    });

    it('rejects files exceeding the size limit', () => {
      expect(source).toContain('MAX_FILE_SIZE_BYTES');
      expect(source).toContain('Archivo demasiado grande');
    });

    it('limits the number of images per request', () => {
      expect(source).toContain('MAX_FILES');
      expect(source).toContain('Se excede el límite');
    });
  });

  describe('send-message-notification', () => {
    const source = readFunction('send-message-notification');

    it('verifies the caller JWT before processing', () => {
      expect(source).toContain('verifyUserJwt');
      expect(source).toContain('authorization');
      expect(source).toContain('Missing or invalid authorization token');
    });

    it('does not log the recipient email address', () => {
      expect(source).not.toMatch(/console\.log.*user\.email/);
    });

    it('logs only opaque identifiers without PII', () => {
      expect(source).toContain('recipient=${recipientId}');
      expect(source).not.toContain('${user.email}');
    });

    it('rejects callers that are not conversation participants', () => {
      expect(source).toContain('User is not a participant in this conversation');
      expect(source).toContain('callerId !== record.sender_id');
    });
  });
});

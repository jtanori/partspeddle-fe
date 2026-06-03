import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

// Mock Supabase
const mockSupabase = createClient('', '');
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  })),
}));

describe('API Identification Route - Unit & Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if Authorization header is missing', async () => {
    const req = new NextRequest('http://localhost/api/gemini/identify', { method: 'POST' });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 401 if user session is invalid', async () => {
    (mockSupabase.auth.getUser as any).mockResolvedValue({ data: { user: null }, error: new Error('Invalid token') });
    
    const req = new NextRequest('http://localhost/api/gemini/identify', { 
        method: 'POST',
        headers: { 'Authorization': 'Bearer invalid_token' }
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 400 if image attachment is missing', async () => {
    (mockSupabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: '123' } }, error: null });
    
    const formData = new FormData();
    formData.append('mode', 'component');
    
    const req = new NextRequest('http://localhost/api/gemini/identify', { 
        method: 'POST',
        headers: { 'Authorization': 'Bearer valid_token' },
        body: formData
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 400 if mode is invalid', async () => {
    (mockSupabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: '123' } }, error: null });
    
    const formData = new FormData();
    formData.append('image', new File(['test'], 'test.png'));
    formData.append('mode', 'invalid_mode');
    
    const req = new NextRequest('http://localhost/api/gemini/identify', { 
        method: 'POST',
        headers: { 'Authorization': 'Bearer valid_token' },
        body: formData
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 200 on successful invocation', async () => {
    (mockSupabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: '123' } }, error: null });
    (mockSupabase.functions.invoke as any).mockResolvedValue({ 
        data: { system: 'Powertrain', part_type: 'Alternator', confidence_scores: { part_type_accuracy: 0.95 } }, 
        error: null 
    });
    
    const formData = new FormData();
    formData.append('image', new File(['test'], 'test.png'));
    formData.append('mode', 'component');
    
    const req = new NextRequest('http://localhost/api/gemini/identify', { 
        method: 'POST',
        headers: { 'Authorization': 'Bearer valid_token' },
        body: formData
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.system).toBe('Powertrain');
  });
});

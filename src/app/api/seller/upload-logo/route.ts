import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Multipart upload needs to be handled via FormData
  // This is a placeholder for the actual implementation using Supabase Storage client
  return NextResponse.json({ 
    error: "Multipart upload functionality requires Supabase Storage SDK configuration." 
  }, { status: 501 });
}

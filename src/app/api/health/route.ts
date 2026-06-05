import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    message: "PartsPeddle Core API online (Next.js App Router)" 
  });
}

import { NextResponse } from 'next/server';

// This route is a stub — dashboard data comes directly from the FastAPI backend.
// Kept for compatibility; remove if not needed.
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Use NEXT_PUBLIC_BACKEND_URL to connect to FastAPI backend' },
    { status: 501 }
  );
}

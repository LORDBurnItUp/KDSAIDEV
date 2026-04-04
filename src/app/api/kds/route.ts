import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  const { message } = await request.json();
  return NextResponse.json({ response: `KDS AI received: "${message}"` });
}
export async function GET() {
  return NextResponse.json({ status: 'KDS API v2.0', endpoints: ['POST /api/kds', 'POST /api/kds/memory', 'POST /api/kds/workflow'] });
}

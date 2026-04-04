import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  const { message } = await request.json();
  if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 });
  return NextResponse.json({ response: `KDS AI received: "${message}"`, context: {} });
}

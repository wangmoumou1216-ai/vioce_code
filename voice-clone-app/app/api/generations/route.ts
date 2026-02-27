import { NextResponse } from 'next/server';
import { listGenerations } from '@/lib/db';

export async function GET() {
  try {
    const generations = listGenerations();
    return NextResponse.json(generations);
  } catch (error) {
    console.error('GET /api/generations error:', error);
    return NextResponse.json({ error: 'Failed to fetch generations' }, { status: 500 });
  }
}

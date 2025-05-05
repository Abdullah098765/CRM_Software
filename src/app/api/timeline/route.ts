import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { TimelineEvent } from '@/models/TimelineEvent';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const events = await TimelineEvent.find({ leadId })
      .sort({ createdAt: -1 });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline events' },
      { status: 500 }
    );
  }
} 
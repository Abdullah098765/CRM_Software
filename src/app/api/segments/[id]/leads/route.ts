import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Segment } from '@/models/Segment';
import { Lead } from '@/models/Lead';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // First, get the segment to access its stored query
    const segment = await Segment.findById(params.id);
    if (!segment) {
      return NextResponse.json(
        { error: 'Segment not found' },
        { status: 404 }
      );
    }

    // Parse the stored query string back to an object
    const query = JSON.parse(segment.query);

    // Log the parsed query for debugging
    console.log('Parsed query:', JSON.stringify(query, null, 2));

    // Use the parsed query to fetch leads
    const leads = await Lead.find(query).sort({ createdAt: -1 });

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching segment leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segment leads' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Lead } from '@/models/Lead';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const lead = await Lead.findByIdAndUpdate(
      params.id,
      { isArchived: true },
      { new: true }
    );

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error archiving lead:', error);
    return NextResponse.json(
      { error: 'Failed to archive lead' },
      { status: 500 }
    );
  }
} 
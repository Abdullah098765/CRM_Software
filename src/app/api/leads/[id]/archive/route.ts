import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Lead } from '@/models/Lead';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = params;
    const lead = await Lead.findById(id);

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    lead.isArchived = true;
    await lead.save();

    return NextResponse.json(
      { message: 'Lead archived successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error archiving lead:', error);
    return NextResponse.json(
      { error: 'Failed to archive lead' },
      { status: 500 }
    );
  }
} 
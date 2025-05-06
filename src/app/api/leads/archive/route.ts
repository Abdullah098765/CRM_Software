import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Lead } from '@/models/Lead';

export async function POST(request: Request) {
  try {
    const { leadIds } = await request.json();
    
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid lead IDs' },
        { status: 400 }
      );
    }

    await connectDB();

    // Update all leads to be archived
    const result = await Lead.updateMany(
      { _id: { $in: leadIds } },
      { $set: { isArchived: true } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'No leads were updated' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Successfully archived ${result.modifiedCount} leads`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error archiving leads:', error);
    return NextResponse.json(
      { error: 'Failed to archive leads' },
      { status: 500 }
    );
  }
} 
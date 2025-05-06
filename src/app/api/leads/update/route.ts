import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Lead } from '@/models/Lead';

export async function POST(request: Request) {
  try {
    const { leadIds, updates } = await request.json();
    
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid lead IDs' },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    // Validate allowed fields
    const allowedFields = ['status', 'priority', 'notes'];
    const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields: ${invalidFields.join(', ')}` },
        { status: 400 }
      );
    }

    await connectDB();

    // Update all leads with the provided fields
    const result = await Lead.updateMany(
      { _id: { $in: leadIds } },
      { $set: updates }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'No leads were updated' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Successfully updated ${result.modifiedCount} leads`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating leads:', error);
    return NextResponse.json(
      { error: 'Failed to update leads' },
      { status: 500 }
    );
  }
} 
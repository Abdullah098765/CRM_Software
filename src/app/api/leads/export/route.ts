import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Lead } from '@/models/Lead';
import { parse } from 'json2csv';

export async function GET() {
  try {
    await connectDB();

    const leads = await Lead.find({ isArchived: false })
      .select('-__v')
      .lean();

    if (!leads || leads.length === 0) {
      return NextResponse.json(
        { error: 'No leads found' },
        { status: 404 }
      );
    }

    const fields = [
      'businessName',
      'contactPerson',
      'email',
      'phone',
      'status',
      'priority',
      'notes',
      'createdAt',
      'updatedAt'
    ];

    const csv = parse(leads, { fields });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=leads.csv'
      }
    });
  } catch (error) {
    console.error('Error exporting leads:', error);
    return NextResponse.json(
      { error: 'Failed to export leads' },
      { status: 500 }
    );
  }
} 
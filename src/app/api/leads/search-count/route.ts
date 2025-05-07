import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Lead } from '@/models/Lead';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchValue = searchParams.get('query');

    if (!searchValue) {
      return NextResponse.json({ leadsCount: 0 });
    }

    await connectDB();

    // Create a case-insensitive regex for the search
    const searchRegex = new RegExp(searchValue, 'i');

    // Search across multiple fields
    const leadsCount = await Lead.countDocuments({
      $or: [
        { businessName: searchRegex },
        { contactPerson: searchRegex },
        { email: searchRegex },
        { phoneNumber: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
        { businessCategory: searchRegex },
        { businessType: searchRegex }
      ],
      isArchived: false
    });

    return NextResponse.json({ leadsCount });
  } catch (error) {
    console.error('Error searching leads:', error);
    return NextResponse.json(
      { error: 'Failed to search leads' },
      { status: 500 }
    );
  }
} 
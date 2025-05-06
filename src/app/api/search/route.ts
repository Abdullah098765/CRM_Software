import { NextResponse } from 'next/server';
import { Lead } from '@/models/Lead';
import { Segment } from '@/models/Segment';
import { Task } from '@/models/Task';
import connectDB from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const type = searchParams.get('type') || 'all';

    await connectDB();

    let results = {
      leads: [],
      segments: [],
      tasks: []
    };

    if (type === 'all' || type === 'leads') {
      results.leads = await Lead.find({
        $or: [
          { businessName: { $regex: query, $options: 'i' } },
          { contactPerson: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { phoneNumber: { $regex: query, $options: 'i' } },
          { businessCategory: { $regex: query, $options: 'i' } },
          { city: { $regex: query, $options: 'i' } },
          { state: { $regex: query, $options: 'i' } },
          { country: { $regex: query, $options: 'i' } }
        ]
      }).limit(5);
    }

    if (type === 'all' || type === 'segments') {
      results.segments = await Segment.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }).limit(5);
    }

    if (type === 'all' || type === 'tasks') {
      results.tasks = await Task.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }).populate('leadId', 'businessName').limit(5);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
} 
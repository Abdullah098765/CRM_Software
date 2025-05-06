import { NextResponse } from 'next/server';
import { Lead } from '@/models/Lead';
import { Segment } from '@/models/Segment';
import { Task } from '@/models/Task';
import connectDB from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim() || '';
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query) {
      return NextResponse.json({ 
        segments: [], 
        tasks: [], 
        leads: [],
        pagination: {
          hasMore: false,
          page: 1,
          total: 0
        }
      });
    }

    await connectDB();

    let results = {
      segments: [],
      tasks: [],
      leads: [],
      pagination: {
        hasMore: false,
        page: page,
        total: 0
      }
    };

    // Always fetch segments first
    const segments = await Segment.find({
      name: { $regex: query, $options: 'i' }
    }).sort({ name: 1 }).limit(5);
    results.segments = segments;

    // Then fetch tasks
    const tasks = await Task.find({
      title: { $regex: query, $options: 'i' }
    })
    .populate('leadId', 'businessName')
    .sort({ dueDate: 1 })
    .limit(5);
    results.tasks = tasks;

    // Finally fetch leads with pagination
    if (type === 'all' || type === 'leads') {
      const skip = (page - 1) * limit;
      
      // Get total count for pagination
      const total = await Lead.countDocuments({
        $or: [
          { businessName: { $regex: query, $options: 'i' } },
          { contactPerson: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { phoneNumber: { $regex: query, $options: 'i' } },
          { city: { $regex: query, $options: 'i' } },
          { state: { $regex: query, $options: 'i' } }
        ],
        isArchived: false
      });

      const leads = await Lead.find({
        $or: [
          { businessName: { $regex: query, $options: 'i' } },
          { contactPerson: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { phoneNumber: { $regex: query, $options: 'i' } },
          { city: { $regex: query, $options: 'i' } },
          { state: { $regex: query, $options: 'i' } }
        ],
        isArchived: false
      })
      .sort({ businessName: 1 })
      .skip(skip)
      .limit(limit);
      results.leads = leads;

      results.pagination = {
        hasMore: skip + leads.length < total,
        page: page,
        total: total
      };
    }

    // Log the results for debugging
    console.log('Search Results:', {
      query,
      segmentsCount: results.segments.length,
      tasksCount: results.tasks.length,
      leadsCount: results.leads.length,
      segments: results.segments.map(s => s.name),
      tasks: results.tasks.map(t => t.title)
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
} 
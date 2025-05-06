import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Segment } from '@/models/Segment';
import { Lead } from '@/models/Lead';
import { Types } from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    const segments = await Segment.find().sort({ createdAt: -1 });
    return NextResponse.json(segments);
  } catch (error) {
    console.error('Error fetching segments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();

    // Get user from request headers
    const userHeader = request.headers.get('user');
    if (!userHeader) {
      return NextResponse.json(
        { error: 'User information is required' },
        { status: 400 }
      );
    }

    const userData = JSON.parse(userHeader);
    if (!userData.email || !userData.name) {
      return NextResponse.json(
        { error: 'Invalid user information' },
        { status: 400 }
      );
    }

    // Build the query based on filter criteria
    const query: any = {};

    // Handle array filters
    const arrayFilters = [
      'status',
      'priority',
      'businessCategory',
      'businessType',
      'serviceInterest',
      'websiteStatus',
      'source'
    ];

    arrayFilters.forEach(field => {
      if (body.filterCriteria[field]) {
        const value = body.filterCriteria[field];
        if (Array.isArray(value) && value.length > 0) {
          query[field] = { $in: value };
        } else if (!Array.isArray(value) && value) {
          query[field] = value;
        }
      }
    });

    // Handle createdBy separately to support multiple emails
    if (body.filterCriteria.createdBy) {
      const createdByValue = body.filterCriteria.createdBy;
      if (Array.isArray(createdByValue) && createdByValue.length > 0) {
        query['createdBy.email'] = { $in: createdByValue };
      } else if (!Array.isArray(createdByValue) && createdByValue) {
        query['createdBy.email'] = createdByValue;
      }
    }

    // Handle location filters
    if (body.filterCriteria.location) {
      const locationQuery: any = {};
      
      // Handle country
      if (body.filterCriteria.location.country && body.filterCriteria.location.country.length > 0) {
        locationQuery.$or = [
          { country: { $in: body.filterCriteria.location.country } }
        ];
      }
      
      // Handle state
      if (body.filterCriteria.location.state && body.filterCriteria.location.state.length > 0) {
        locationQuery.$or = [
          ...(locationQuery.$or || []),
          { state: { $in: body.filterCriteria.location.state } }
        ];
      }
      
      // Handle city
      if (body.filterCriteria.location.city && body.filterCriteria.location.city.length > 0) {
        locationQuery.$or = [
          ...(locationQuery.$or || []),
          { city: { $in: body.filterCriteria.location.city } }
        ];
      }
      
      if (Object.keys(locationQuery).length > 0) {
        query.$or = locationQuery.$or;
      }
    }

    // Handle boolean filters
    if (body.filterCriteria.isArchived !== undefined) {
      query.isArchived = body.filterCriteria.isArchived;
    }

    // Handle empty field filters
    if (body.filterCriteria.hasEmptyEmail) {
      query.$or = [
        { email: { $exists: false } },
        { email: null },
        { email: '' }
      ];
    }

    if (body.filterCriteria.hasEmptyPhone) {
      query.$or = query.$or || [];
      query.$or.push(
        { phoneNumber: { $exists: false } },
        { phoneNumber: null },
        { phoneNumber: '' }
      );
    }

    // Handle date range filters
    if (body.filterCriteria.followUpDate?.from || body.filterCriteria.followUpDate?.to) {
      query.followUpDate = {};
      if (body.filterCriteria.followUpDate.from) {
        query.followUpDate.$gte = new Date(body.filterCriteria.followUpDate.from);
      }
      if (body.filterCriteria.followUpDate.to) {
        query.followUpDate.$lte = new Date(body.filterCriteria.followUpDate.to);
      }
    }

    if (body.filterCriteria.createdAt?.from || body.filterCriteria.createdAt?.to) {
      query.createdAt = {};
      if (body.filterCriteria.createdAt.from) {
        query.createdAt.$gte = new Date(body.filterCriteria.createdAt.from);
      }
      if (body.filterCriteria.createdAt.to) {
        query.createdAt.$lte = new Date(body.filterCriteria.createdAt.to);
      }
    }

    // Log the query for debugging
    console.log('Segment query:', JSON.stringify(query, null, 2));

    // Count matching leads
    const leadCount = await Lead.countDocuments(query);
    console.log('Lead count:', leadCount);

    // Create the segment with the query
    const segment = new Segment({
      name: body.name,
      description: body.description,
      filterCriteria: body.filterCriteria,
      query:JSON.stringify(query, null, 2), // Save the query
      leadCount,
      createdBy: {
        email: userData.email,
        name: userData.name
      }
    });

    await segment.save();

    return NextResponse.json(segment);
  } catch (error) {
    console.error('Error creating segment:', error);
    return NextResponse.json(
      { error: 'Failed to create segment' },
      { status: 500 }
    );
  }
} 
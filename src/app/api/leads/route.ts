import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Lead } from '@/models/Lead';

export async function GET() {
  try {
    await connectDB();
    const leads = await Lead.find().sort({ createdAt: -1 });
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

interface LeadData {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: string;
  priority: string;
  notes: string;
}

export async function POST(req: Request) {
  try {
    const data: LeadData = await req.json();
    console.log('Received request body:', data);

    const { user } = data;
    console.log('User from request:', user);

    if (!user || !user.email) {
      return NextResponse.json(
        { error: 'User information is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the count of existing leads to generate a unique leadId
    const count = await Lead.countDocuments();
    const leadId = String(count + 1).padStart(7, '0');

    // Prepare the lead data with required fields and defaults
    const leadData = {
      ...data,
      leadId, // Add the generated leadId
      createdBy: user,
      status: data.status || 'new',
      priority: data.priority || 'medium',
      isArchived: false,
      source: data.source || 'manual',
      location: {
        city: data.location?.city || '',
        state: data.location?.state || '',
        country: data.location?.country || '' // Add country field
      }
    };

    // Remove user object from leadData
    delete leadData.user;

    console.log('Prepared lead data:', leadData);

    // Validate required fields
    const requiredFields = ['businessName', 'createdBy', 'businessCategory'];
    const missingFields = requiredFields.filter(field => !leadData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate that either email or phone number is provided
    if (!leadData.email && !leadData.phone) {
      return NextResponse.json(
        { error: 'Either email or phone number must be provided' },
        { status: 400 }
      );
    }

    // Validate location fields
    if (!leadData.country || !leadData.state || !leadData.city) {
      return NextResponse.json(
        { error: 'Location fields (country, state, city) are required' },
        { status: 400 }
      );
    }

    try {
      const lead = new Lead(leadData);
      console.log('Created lead instance:', lead);
      await lead.save();
      console.log('Saved lead successfully');
      return NextResponse.json(lead);
    } catch (saveError: any) {
      console.error('Error saving lead:', saveError);
      console.error('Validation errors:', saveError.errors);
      return NextResponse.json(
        { error: `Failed to save lead: ${saveError.message}` },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error creating lead:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown error');
    return NextResponse.json(
      { error: `Failed to create lead: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 
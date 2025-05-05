import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import { Lead } from '@/models/Lead';
import { stringify } from 'csv-stringify/sync';

interface LeadExport {
  businessName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  businessCategory: string;
  websiteUrl?: string;
  city?: string;
  state?: string;
  country?: string;
  notes?: string;
  status: string;
  priority: string;
  followUpDate?: Date;
  source: string;
  serviceInterest?: string;
  websiteStatus?: string;
}

export async function GET(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the Firebase token
    const token = authHeader.split('Bearer ')[1];
    try {
      await auth.verifyIdToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();
    const leads = await Lead.find({ isArchived: false });

    const csv = stringify(leads as LeadExport[], {
      header: true,
      columns: {
        businessName: 'Business Name',
        contactPerson: 'Contact Person',
        email: 'Email',
        phoneNumber: 'Phone',
        businessCategory: 'Business Category',
        websiteUrl: 'Website',
        city: 'City',
        state: 'State',
        country: 'Country',
        notes: 'Notes',
        status: 'Status',
        priority: 'Priority',
        followUpDate: 'Follow-up Date',
        source: 'Source',
        serviceInterest: 'Service Interest',
        websiteStatus: 'Website Status'
      }
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="leads.csv"'
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
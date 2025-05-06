import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Segment } from '@/models/Segment';
import { Lead } from '@/models/Lead';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Get the segment
    const segment = await Segment.findById(params.id);
    if (!segment) {
      return NextResponse.json(
        { error: 'Segment not found' },
        { status: 404 }
      );
    }

    // Parse the stored query
    const query = JSON.parse(segment.query);

    // Fetch leads
    const leads = await Lead.find(query).sort({ createdAt: -1 });

    // Convert leads to CSV
    const headers = [
      'Business Name',
      'Contact Person',
      'Phone Number',
      'Email',
      'Business Category',
      'Website URL',
      'City',
      'State',
      'Country',
      'Status',
      'Priority',
      'Follow-up Date',
      'Source',
      'Service Interest',
      'Website Status',
      'Notes'
    ].join(',');

    const rows = leads.map(lead => [
      `"${lead.businessName || ''}"`,
      `"${lead.contactPerson || ''}"`,
      `"${lead.phoneNumber || ''}"`,
      `"${lead.email || ''}"`,
      `"${lead.businessCategory || ''}"`,
      `"${lead.websiteUrl || ''}"`,
      `"${lead.city || ''}"`,
      `"${lead.state || ''}"`,
      `"${lead.country || ''}"`,
      `"${lead.status || ''}"`,
      `"${lead.priority || ''}"`,
      `"${lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : ''}"`,
      `"${lead.source || ''}"`,
      `"${lead.serviceInterest || ''}"`,
      `"${lead.websiteStatus || ''}"`,
      `"${lead.notes || ''}"`
    ].join(','));

    const csv = [headers, ...rows].join('\n');

    // Create response with CSV file
    const response = new NextResponse(csv);
    response.headers.set('Content-Type', 'text/csv');
    response.headers.set('Content-Disposition', `attachment; filename="${segment.name}-leads.csv"`);

    return response;
  } catch (error) {
    console.error('Error downloading leads:', error);
    return NextResponse.json(
      { error: 'Failed to download leads' },
      { status: 500 }
    );
  }
} 
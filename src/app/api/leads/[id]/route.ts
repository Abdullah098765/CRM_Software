import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Lead } from '@/models/Lead';
import { TimelineEvent } from '@/models/TimelineEvent';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const lead = await Lead.findById(context.params.id);
    
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
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

    const user = JSON.parse(userHeader);
    const leadId = context.params.id;
    const lead = await Lead.findById(leadId);

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Track changes for timeline events
    const changes: { field: string; oldValue: any; newValue: any }[] = [];

    // Check for status change
    if (body.status && body.status !== lead.status) {
      changes.push({
        field: 'status',
        oldValue: lead.status,
        newValue: body.status
      });
    }

    // Check for priority change
    if (body.priority && body.priority !== lead.priority) {
      changes.push({
        field: 'priority',
        oldValue: lead.priority,
        newValue: body.priority
      });
    }

    // Check for follow-up date change
    if (body.followUpDate && body.followUpDate !== lead.followUpDate) {
      changes.push({
        field: 'followUpDate',
        oldValue: lead.followUpDate,
        newValue: body.followUpDate
      });
    }

    // Update the lead with user information

    
    const updatedLead = await Lead.findByIdAndUpdate(
      leadId,
      { 
        ...body,
        updatedBy: {
          name: user.name,
          email: user.email
        }
      },
      { new: true }
    );

    // Create timeline events for each change
    for (const change of changes) {
      const event = new TimelineEvent({
        leadId: leadId,
        type: 'lead_updated',
        title: `Lead ${change.field} updated`,
        description: `${change.field} changed from ${change.oldValue} to ${change.newValue}`,
        metadata: {
          field: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue
        },
        createdBy: {
          email: user.email,
          name: user.name
        }
      });
      await event.save();
    }

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const lead = await Lead.findByIdAndDelete(context.params.id);

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
} 
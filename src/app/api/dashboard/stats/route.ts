import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Lead } from '@/models/Lead';

// Define all possible lead statuses
const LEAD_STATUSES = [
  'new',
  'contacted',
  'follow-up',
  'converted',
  'not-interested'
] as const;

export async function GET() {
  try {
    // Connect to database
    try {
      await connectDB();
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Get total leads count
    const totalLeads = await Lead.countDocuments({ isArchived: false });

    // Get leads count by status
    const leadsByStatus = await Promise.all(
      LEAD_STATUSES.map(async (status) => {
        const count = await Lead.countDocuments({ 
          status,
          isArchived: false 
        });
        return { status, count };
      })
    );

    // Get upcoming follow-ups
    const upcomingFollowUps = await Lead.find({
      status: 'follow-up',
      followUpDate: { $gte: new Date() },
      isArchived: false
    })
    .sort({ followUpDate: 1 })
    .limit(5)
    .select('_id businessName followUpDate');

    // Format the response
    const stats = {
      totalLeads,
      leadsByStatus: Object.fromEntries(
        leadsByStatus.map(({ status, count }) => [status, count])
      ),
      upcomingFollowUps
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Task } from '@/models/Task';
import { TimelineEvent } from '@/models/TimelineEvent';
import { Lead } from '@/models/Lead';
import { Types } from 'mongoose';

interface LeadDocument {
  _id: Types.ObjectId;
  businessName: string;
  contactPerson: string;
}

export async function GET() {
  try {
    await connectDB();

    // Fetch all tasks and populate lead information
    const tasks = await Task.find()
      .sort({ createdAt: -1 })
      .lean();

    // Get unique lead IDs
    const leadIds = [...new Set(tasks.map(task => task.leadId.toString()))];

    // Fetch all leads in one query
    const leads = await Lead.find(
      { _id: { $in: leadIds } },
      { businessName: 1, contactPerson: 1 }
    ).lean();

    // Create a map of lead ID to lead data
    const leadMap = leads.reduce((acc, lead) => {
      const leadDoc = lead as LeadDocument;
      acc[leadDoc._id.toString()] = {
        businessName: leadDoc.businessName,
        contactPerson: leadDoc.contactPerson
      };
      return acc;
    }, {} as Record<string, { businessName: string; contactPerson: string }>);

    // Add lead information to each task
    const tasksWithLeads = tasks.map(task => ({
      ...task,
      lead: leadMap[task.leadId.toString()]
    }));

    return NextResponse.json(tasksWithLeads);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
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

    const user = JSON.parse(userHeader);

    const task = new Task({
      ...body,
      assignedTo: {
        email: user.email,
        name: user.name
      }
    });

    await task.save();

    // Create timeline event
    const timelineEvent = new TimelineEvent({
      leadId: body.leadId,
      type: 'task_created',
      title: 'New Task Created',
      description: `Task "${body.title}" was created`,
      metadata: {
        taskId: task._id,
        title: body.title,
        priority: body.priority,
        dueDate: body.dueDate
      },
      createdBy: {
        email: user.email,
        name: user.name
      }
    });

    await timelineEvent.save();

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
} 
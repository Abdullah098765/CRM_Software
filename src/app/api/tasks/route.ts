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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const dueDateStart = searchParams.get('dueDateStart');
    const dueDateEnd = searchParams.get('dueDateEnd');

    await connectDB();

    // Build query
    const query: any = {};

    if (leadId) query.leadId = leadId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query['assignedTo.email'] = assignedTo;
    
    if (dueDateStart || dueDateEnd) {
      query.dueDate = {};
      if (dueDateStart) query.dueDate.$gte = new Date(dueDateStart);
      if (dueDateEnd) query.dueDate.$lte = new Date(dueDateEnd);
    }

    const tasks = await Task.find(query)
      .sort({ dueDate: 1, priority: -1 })
      .populate('leadId', 'name email');

    return NextResponse.json(tasks);
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
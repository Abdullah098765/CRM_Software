import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Task } from '@/models/Task';

export async function POST(request: Request) {
  try {
    const taskData = await request.json();
    
    // Validate required fields
    const requiredFields = ['leadId', 'title', 'description', 'assignedTo'];
    const missingFields = requiredFields.filter(field => !taskData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    await connectDB();

    const task = await Task.create(taskData);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
} 
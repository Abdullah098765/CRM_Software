import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { GoogleUser } from '@/models/GoogleUser';

export async function GET() {
  try {
    await connectDB();
    const users = await GoogleUser.find().select('email name').sort({ name: 1 });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, email, name, photoURL } = body;

    if (!id || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await GoogleUser.findOne({ uid: id });
    
    if (existingUser) {
      // Update last login time
      existingUser.lastLogin = new Date();
      await existingUser.save();
      return NextResponse.json(existingUser);
    }

    // Create new user
    const newUser = await GoogleUser.create({
      uid: id,
      email,
      name,
      photoURL,
      lastLogin: new Date(),
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json(
      { error: 'Failed to process user data' },
      { status: 500 }
    );
  }
} 
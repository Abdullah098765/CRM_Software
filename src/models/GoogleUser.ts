import mongoose from 'mongoose';

export interface IGoogleUser extends mongoose.Document {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

const googleUserSchema = new mongoose.Schema<IGoogleUser>(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    photoURL: String,
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
googleUserSchema.index({ email: 1 });
googleUserSchema.index({ uid: 1 });

export const GoogleUser = mongoose.models.GoogleUser || mongoose.model<IGoogleUser>('GoogleUser', googleUserSchema); 
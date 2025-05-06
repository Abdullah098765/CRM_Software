import mongoose from 'mongoose';

export interface ITask extends mongoose.Document {
  leadId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  dueDate?: Date;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: {
    email: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new mongoose.Schema<ITask>(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    assignedTo: {
      email: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
taskSchema.index({ leadId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ 'assignedTo.email': 1 });

// Add text index for search
taskSchema.index({
  title: 'text',
  description: 'text'
}, {
  weights: {
    title: 10,
    description: 5
  }
});

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema); 
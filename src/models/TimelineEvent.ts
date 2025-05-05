import mongoose from 'mongoose';

export interface ITimelineEvent extends mongoose.Document {
  leadId: mongoose.Types.ObjectId;
  type: 'lead_created' | 'lead_updated' | 'task_created' | 'task_updated';
  title: string;
  description: string;
  metadata: {
    taskId?: string;
    taskTitle?: string;
    taskStatus?: string;
    field?: string;
    oldValue?: any;
    newValue?: any;
  };
  createdBy: {
    email: string;
    name: string;
  };
  createdAt: Date;
}

const timelineEventSchema = new mongoose.Schema<ITimelineEvent>(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    type: {
      type: String,
      enum: ['lead_created', 'lead_updated', 'task_created', 'task_updated'],
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
    metadata: {
      taskId: String,
      taskTitle: String,
      taskStatus: String,
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
    },
    createdBy: {
      email: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      }
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
timelineEventSchema.index({ leadId: 1, createdAt: -1 });

export const TimelineEvent = mongoose.models.TimelineEvent || mongoose.model<ITimelineEvent>('TimelineEvent', timelineEventSchema); 
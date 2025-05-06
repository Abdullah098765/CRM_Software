import { Types } from 'mongoose';
import { ILead } from '@/models/Lead';
import { ISegment } from '@/models/Segment';
import { ITask } from '@/models/Task';

export interface SearchResult {
  leads: (ILead & { _id: Types.ObjectId })[];
  segments: (ISegment & { _id: Types.ObjectId })[];
  tasks: (ITask & { _id: Types.ObjectId; leadId: { businessName: string } })[];
  pagination: {
    hasMore: boolean;
    page: number;
    total: number;
  };
} 
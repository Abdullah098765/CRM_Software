import mongoose from 'mongoose';

export interface ISegment extends mongoose.Document {
  name: string;
  description?: string;
  filterCriteria: {
    status?: string | string[];
    priority?: string | string[];
    businessCategory?: string | string[];
    businessType?: string | string[];
    location?: {
      city?: string | string[];
      state?: string | string[];
      country?: string | string[];
    };
    serviceInterest?: string | string[];
    websiteStatus?: string | string[];
    source?: string | string[];
    createdBy?: string | string[];
    isArchived?: boolean;
    hasEmptyEmail?: boolean;
    hasEmptyPhone?: boolean;
    followUpDate?: {
      from?: string;
      to?: string;
    };
    createdAt?: {
      from?: string;
      to?: string;
    };
  };
  leadCount: number;
  createdBy: {
    email: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const segmentSchema = new mongoose.Schema<ISegment>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    filterCriteria: {
      status: {
        type: mongoose.Schema.Types.Mixed,
        default: undefined,
      },
      priority: {
        type: mongoose.Schema.Types.Mixed,
        default: undefined,
      },
      businessCategory: {
        type: mongoose.Schema.Types.Mixed,
        default: undefined,
      },
      businessType: {
        type: mongoose.Schema.Types.Mixed,
        default: undefined,
      },
      location: {
        city: {
          type: mongoose.Schema.Types.Mixed,
          default: undefined,
        },
        state: {
          type: mongoose.Schema.Types.Mixed,
          default: undefined,
        },
        country: {
          type: mongoose.Schema.Types.Mixed,
          default: undefined,
        },
      },
      serviceInterest: {
        type: mongoose.Schema.Types.Mixed,
        default: undefined,
      },
      websiteStatus: {
        type: mongoose.Schema.Types.Mixed,
        default: undefined,
      },
      source: {
        type: mongoose.Schema.Types.Mixed,
        default: undefined,
      },
      createdBy: {
        type: mongoose.Schema.Types.Mixed,
        default: undefined,
      },
      isArchived: {
        type: Boolean,
        default: false,
      },
      hasEmptyEmail: {
        type: Boolean,
        default: false,
      },
      hasEmptyPhone: {
        type: Boolean,
        default: false,
      },
      followUpDate: {
        from: String,
        to: String,
      },
      createdAt: {
        from: String,
        to: String,
      },
    },
    leadCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
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
segmentSchema.index({ name: 1 });
segmentSchema.index({ 'filterCriteria.status': 1 });
segmentSchema.index({ 'filterCriteria.priority': 1 });
segmentSchema.index({ 'filterCriteria.businessCategory': 1 });
segmentSchema.index({ 'filterCriteria.businessType': 1 });
segmentSchema.index({ 'filterCriteria.location.city': 1 });
segmentSchema.index({ 'filterCriteria.location.state': 1 });
segmentSchema.index({ 'filterCriteria.location.country': 1 });
segmentSchema.index({ 'createdBy.email': 1 });
segmentSchema.index({ leadId: 1 });
segmentSchema.index({ status: 1 });
segmentSchema.index({ priority: 1 });
segmentSchema.index({ followUpDate: 1 });
segmentSchema.index({ businessName: 1 });
segmentSchema.index({ email: 1 });
segmentSchema.index({ city: 1 });
segmentSchema.index({ state: 1 });
segmentSchema.index({ country: 1 });

export const Segment = mongoose.models.Segment || mongoose.model<ISegment>('Segment', segmentSchema); 
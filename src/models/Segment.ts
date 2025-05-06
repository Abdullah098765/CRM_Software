import mongoose, { Schema, Document } from 'mongoose';

export interface ISegment extends Document {
  name: string;
  description: string;
  filterCriteria: {
    status: string[];
    priority: string[];
    businessCategory: string[];
    businessType: string[];
    location: {
      country: string[];
      state: string[];
      city: string[];
    };
    serviceInterest: string[];
    websiteStatus: string[];
    source: string[];
    createdBy: string[];
    isArchived: boolean;
    hasEmptyEmail: boolean;
    hasEmptyPhone: boolean;
    followUpDate: {
      from: string;
      to: string;
    };
    createdAt: {
      from: string;
      to: string;
    };
  };
  query: any; // Store the MongoDB query
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
    query: {
      type: Object,
      required: true,
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

// Add text index for search
segmentSchema.index({
  name: 'text',
  description: 'text'
}, {
  weights: {
    name: 10,
    description: 5
  }
});

export const Segment = mongoose.models.Segment || mongoose.model<ISegment>('Segment', segmentSchema); 
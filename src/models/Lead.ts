import mongoose from 'mongoose';

export interface ILead extends mongoose.Document {
  leadId: string;
  businessName: string;
  businessType: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  businessCategory: string;
  websiteUrl?: string;
  city: string;
  state: string;
  country: string;
  notes?: string;
  status: 'new' | 'contacted' | 'follow-up' | 'converted' | 'not-interested';
  priority: 'low' | 'medium' | 'high';
  followUpDate?: Date;
  source: string;
  serviceInterest?: string;
  websiteStatus?: string;
  createdBy?: {
    name: string;
    email: string;
  };
  isArchived: boolean;
  updatedBy?: {
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new mongoose.Schema<ILead>(
  {
    leadId: {
      type: String,
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },
    businessCategory: {
      type: String,
    },
    businessType: {
      type: String,
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    websiteUrl: String,
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    notes: String,
    status: {
      type: String,
      default: 'new',
    },
    priority: {
      type: String,
      default: 'medium',
    },
    followUpDate: Date,
    source: {
      type: String,
    },
    serviceInterest: String,
    websiteStatus: String,
    createdBy: {
      name: String,
      email: String,
    },
    updatedBy: {
      name: String,
      email: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
leadSchema.index({ leadId: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ priority: 1 });
leadSchema.index({ followUpDate: 1 });
leadSchema.index({ businessName: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ city: 1 });
leadSchema.index({ state: 1 });

// Add text index for search
leadSchema.index({
  businessName: 'text',
  contactPerson: 'text',
  email: 'text',
  phoneNumber: 'text',
  businessCategory: 'text',
  city: 'text',
  state: 'text',
  country: 'text',
  notes: 'text'
}, {
  weights: {
    businessName: 10,
    contactPerson: 5,
    email: 3,
    phoneNumber: 3,
    businessCategory: 2,
    city: 2,
    state: 2,
    country: 2,
    notes: 1
  }
});

export const Lead = mongoose.models.Lead || mongoose.model<ILead>('Lead', leadSchema); 
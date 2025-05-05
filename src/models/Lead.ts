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
      validate: {
        validator: function (v: string) {
          if (v) return true;
          return !!this.email;
        },
        message: 'Either phone number or email is required'
      }
    },
    email: {
      type: String,
      validate: {
        validator: function (v: string) {
          if (v) return true;
          return !!this.phoneNumber;
        },
        message: 'Either phone number or email is required'
      }
    },
    businessCategory: {
      type: String,
      required: true,
    },
    businessType: {
      type: String,
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    websiteUrl: String,
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    notes: String,
    status: {
      type: String,
      enum: ['new', 'contacted', 'follow-up', 'converted', 'not-interested'],
      default: 'new',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    followUpDate: Date,
    source: {
      type: String,
      required: true,
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

export const Lead = mongoose.models.Lead || mongoose.model<ILead>('Lead', leadSchema); 
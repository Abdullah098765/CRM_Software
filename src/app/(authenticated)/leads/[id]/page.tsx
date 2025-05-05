'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import LeadTasks from './tasks/page';

interface Lead {
  _id: string;
  leadId: string;
  businessName: string;
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
  followUpDate?: string;
  source: string;
  serviceInterest?: string;
  websiteStatus?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    name: string;
    email: string;
    id: string;
  };
}

interface User {
  name: string;
  email: string;
  id: string;
}

interface TimelineEvent {
  _id: string;
  type: 'lead_created' | 'task_created' | 'task_updated' | 'lead_updated';
  title: string;
  description: string;
  metadata: {
    taskId?: string;
    taskTitle?: string;
    taskStatus?: string;
    field?: string;
    oldValue?: string;
    newValue?: string;
  };
  createdBy: {
    email: string;
    name: string;
  };
  createdAt: string;
}

export default function LeadDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Lead>();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchLead();
    fetchTimelineEvents();
  }, [id]);

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/leads/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error fetching lead');
      }

      setLead(data);
      reset(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimelineEvents = async () => {
    try {
      const response = await fetch(`/api/timeline?leadId=${id}`);
      if (!response.ok) throw new Error('Failed to fetch timeline events');
      const data = await response.json();
      setTimelineEvents(data);
    } catch (error) {
      console.error('Error fetching timeline events:', error);
    }
  };

  const onSubmit = async (data: Lead) => {
    if (!user) {
      toast.error('User data not found. Please log in again.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          updatedBy: user
        }),
      });

      const updatedLead = await res.json();

      if (!res.ok) {
        throw new Error(updatedLead.error || 'Error updating lead');
      }

      setLead(updatedLead);
      setIsEditing(false);
      toast.success('Lead updated successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: Lead['status']) => {
    if (!lead || !user) return;

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user': JSON.stringify(user)
        },
        body: JSON.stringify({ 
          status: newStatus,
          updatedBy: user
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error updating lead status');
      }

      setLead({ ...lead, status: newStatus });
      toast.success('Lead status updated successfully');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handlePriorityChange = async (newPriority: Lead['priority']) => {
    if (!lead || !user) return;

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user': JSON.stringify(user)
        },
        body: JSON.stringify({ 
          priority: newPriority,
          updatedBy: user
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error updating lead priority');
      }

      setLead({ ...lead, priority: newPriority });
      toast.success('Lead priority updated successfully');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleArchive = async () => {
    if (!lead || !user) return;

    if (!window.confirm('Are you sure you want to archive this lead?')) {
      return;
    }

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isArchived: true,
          updatedBy: user
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error archiving lead');
      }

      toast.success('Lead archived successfully');
      router.push('/leads');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'follow-up':
        return 'bg-purple-100 text-purple-800';
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'not-interested':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Lead['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'lead_created':
        return (
          <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'lead_updated':
        return (
          <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'task_created':
      case 'task_updated':
        return (
          <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'lead_created':
        return 'bg-green-500';
      case 'lead_updated':
        return 'bg-blue-500';
      case 'task_created':
        return 'bg-purple-500';
      case 'task_updated':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading lead
              </h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-yellow-50 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Lead not found
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {lead.businessName}
              </h1>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Lead ID: {lead.leadId}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Created: {new Date(lead.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isEditing ? 'View Details' : 'Edit Lead'}
              </button>
              <button
                type="button"
                onClick={handleArchive}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Archive Lead
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Business Info & Status */}
          <div className="lg:col-span-2 space-y-8">
            {/* Business Information Card */}
            <div className="bg-white shadow-md rounded-lg border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Business Information
                </h3>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                    <dd className="mt-1 text-sm text-gray-900">{lead.contactPerson}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{lead.phoneNumber}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{lead.email}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="mt-1 text-sm text-gray-900">{lead.businessCategory}</dd>
                  </div>
                  {lead.websiteUrl && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Website</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <a href={lead.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                          {lead.websiteUrl}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white shadow-md rounded-lg border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Lead Status
                </h3>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(e.target.value as Lead['status'])}
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(lead.status)}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="converted">Converted</option>
                        <option value="not-interested">Not Interested</option>
                      </select>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Priority</dt>
                    <dd className="mt-1">
                      <select
                        value={lead.priority}
                        onChange={(e) => handlePriorityChange(e.target.value as Lead['priority'])}
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getPriorityColor(lead.priority)}`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Source</dt>
                    <dd className="mt-1 text-sm text-gray-900">{lead.source}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Created By</dt>
                    <dd className="mt-1">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {lead.createdBy.name}
                        </span>
                        <span className="ml-2 text-gray-500 text-xs">
                          {lead.createdBy.email}
                        </span>
                      </div>
                    </dd>
                  </div>
                  {lead.serviceInterest && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Service Interest</dt>
                      <dd className="mt-1 text-sm text-gray-900">{lead.serviceInterest}</dd>
                    </div>
                  )}
                  {lead.websiteStatus && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Website Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">{lead.websiteStatus}</dd>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {lead.city}, {lead.state} {lead.country}
                    </dd>
                  </div>
                  {lead.notes && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900">{lead.notes}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="bg-white shadow-md rounded-lg border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Tasks
                </h3>
              </div>
              <div className="px-6 py-5">
                <LeadTasks />
              </div>
            </div>
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Timeline
                </h3>
              </div>
              <div className="px-6 py-5">
                <div className="flow-root">
                  <ul role="list" className="-mb-8">
                    {timelineEvents.map((event, eventIdx) => (
                      <li key={event._id}>
                        <div className="relative pb-8">
                          {eventIdx !== timelineEvents.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full ${getEventColor(event.type)} flex items-center justify-center ring-8 ring-white`}>
                                {getEventIcon(event.type)}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {format(new Date(event.createdAt), 'MMM d, yyyy h:mm a')}
                                </p>
                              </div>
                              <div className="mt-2 text-sm text-gray-700">
                                <p className="font-medium">{event.title}</p>
                                <p>{event.description}</p>
                                {event.metadata.taskTitle && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    Task: {event.metadata.taskTitle}
                                  </p>
                                )}
                                {event.metadata.field && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    Changed {event.metadata.field} from {event.metadata.oldValue} to {event.metadata.newValue}
                                  </p>
                                )}
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                <p>By {event.createdBy.name}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
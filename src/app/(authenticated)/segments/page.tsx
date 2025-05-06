'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ISegment } from '@/models/Segment';

export default function SegmentsPage() {
  const router = useRouter();
  const [segments, setSegments] = useState<ISegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    filterCriteria: {
      status: [] as string[],
      priority: [] as string[],
      businessCategory: [] as string[],
      businessType: [] as string[],
      location: {
        city: [] as string[],
        state: [] as string[],
        country: [] as string[],
      },
      serviceInterest: [] as string[],
      websiteStatus: [] as string[],
      source: [] as string[],
      createdBy: [] as string[],
      isArchived: false,
      hasEmptyEmail: false,
      hasEmptyPhone: false,
      followUpDate: {
        from: '',
        to: '',
      },
      createdAt: {
        from: '',
        to: '',
      },
    },
  });

  const [users, setUsers] = useState<{ email: string; name: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const STATUS_OPTIONS = ['new', 'contacted', 'follow-up', 'converted', 'not-interested'];
  const PRIORITY_OPTIONS = ['low', 'medium', 'high'];
  const BUSINESS_CATEGORIES = [
    'Home Services',
    'Automotive',
    'Health & Wellness',
    'Food & Beverage',
    'Professional Services',
    'Retail',
    'Construction',
    'Education & Training',
    'Beauty & Personal Care',
    'Other'
  ];
  const BUSINESS_TYPES = [
    'Sole Proprietorship',
    'Partnership',
    'Corporation',
    'LLC',
    'Non-Profit',
    'Other'
  ];
  const SERVICE_INTEREST_OPTIONS = [
    'Website Development',
    'Digital Marketing',
    'SEO Services',
    'Social Media Management',
    'Content Creation',
    'Email Marketing',
    'Other'
  ];
  const WEBSITE_STATUS_OPTIONS = [
    'No Website',
    'Under Construction',
    'Live but Needs Updates',
    'Live and Current',
    'Other'
  ];
  const SOURCE_OPTIONS = [
    'Manual Entry',
    'Import',
    'Website Form',
    'Referral',
    'Other'
  ];

  useEffect(() => {
    fetchSegments();
    fetchUsers();
  }, []);

  const fetchSegments = async () => {
    try {
      const response = await fetch('/api/segments');
      if (!response.ok) {
        throw new Error('Failed to fetch segments');
      }
      const data = await response.json();
      setSegments(data);
    } catch (error) {
      console.error('Error fetching segments:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch segments');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateSegment = async () => {
    try {
      const response = await fetch('/api/segments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create segment');
      }

      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        filterCriteria: {
          status: [],
          priority: [],
          businessCategory: [],
          businessType: [],
          location: {
            city: [],
            state: [],
            country: [],
          },
          serviceInterest: [],
          websiteStatus: [],
          source: [],
          createdBy: [],
          isArchived: false,
          hasEmptyEmail: false,
          hasEmptyPhone: false,
          followUpDate: {
            from: '',
            to: '',
          },
          createdAt: {
            from: '',
            to: '',
          },
        },
      });
      fetchSegments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create segment');
    }
  };

  const handleSelectChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      filterCriteria: {
        ...prev.filterCriteria,
        [field]: Array.isArray(value) ? value : [value]
      }
    }));
  };

  const handleLocationSelectChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      filterCriteria: {
        ...prev.filterCriteria,
        location: {
          ...prev.filterCriteria.location,
          [field]: Array.isArray(value) ? value : [value]
        }
      }
    }));
  };

  const handleDateChange = (field: string, date: string) => {
    setFormData(prev => ({
      ...prev,
      filterCriteria: {
        ...prev.filterCriteria,
        [field]: {
          ...prev.filterCriteria[field],
          from: date
        }
      }
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Segments</h1>
        <button
          onClick={() => router.push('/segments/new')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create New Segment
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="error-message">
          <div className="error-message-icon">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="error-message-text">{error}</div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {segments.map((segment) => (
              <li 
                key={segment._id.toString()}
                onClick={() => router.push(`/segments/${segment._id}`)}
                className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-medium text-gray-900 truncate">
                        {segment.name}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {segment.description}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {segment.leadCount} leads
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Created by {segment.createdBy.name}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Created on {format(new Date(segment.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-8">
              <div className="space-y-6">
                <div className="md:flex md:items-center md:justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                      Create New Segment
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                      Define a new segment by setting up filter criteria for your leads.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateSegment} className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Basic Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filter Criteria Section */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Filter Criteria
                    </h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          multiple
                          value={formData.filterCriteria.status}
                          onChange={(e) => handleSelectChange('status', Array.from(e.target.selectedOptions, option => option.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                        >
                          {STATUS_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                        <select
                          multiple
                          value={formData.filterCriteria.priority}
                          onChange={(e) => handleSelectChange('priority', Array.from(e.target.selectedOptions, option => option.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                        >
                          {PRIORITY_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      Create Segment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
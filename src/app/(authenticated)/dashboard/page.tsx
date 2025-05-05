'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface DashboardStats {
  totalLeads: number;
  leadsByStatus: {
    new: number;
    contacted: number;
    'follow-up': number;
    converted: number;
    'not-interested': number;
  };
  upcomingFollowUps: Array<{
    _id: string;
    leadId: string;
    businessName: string;
    followUpDate: string;
  }>;
}

interface User {
  uid: string;
  name: string;
  email: string;
}

const defaultStats: DashboardStats = {
  totalLeads: 0,
  leadsByStatus: {
    new: 0,
    contacted: 0,
    'follow-up': 0,
    converted: 0,
    'not-interested': 0,
  },
  upcomingFollowUps: [],
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dashboard stats');
      }

      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      setStats(defaultStats);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Welcome back, {user?.name || 'User'}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors duration-200">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-indigo-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Leads
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.totalLeads}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors duration-200">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Converted Leads
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.leadsByStatus.converted}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors duration-200">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    New Leads
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.leadsByStatus.new}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors duration-200">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Follow-up Leads
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.leadsByStatus['follow-up']}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Status Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Lead Status Distribution</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(stats.leadsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      status === 'new' ? 'bg-blue-500' :
                      status === 'contacted' ? 'bg-yellow-500' :
                      status === 'follow-up' ? 'bg-purple-500' :
                      status === 'converted' ? 'bg-green-500' :
                      'bg-red-500'
                    }`}></span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {status.replace('-', ' ')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Follow-ups */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Follow-ups</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.upcomingFollowUps.map((followUp) => (
              <div key={followUp._id} className="hover:bg-gray-50 transition-colors duration-150">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-3">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {followUp.businessName}
                      </p>
                      <p className="flex-shrink-0 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 px-2 py-0.5">
                        {followUp.leadId}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-sm text-gray-500">
                        {format(new Date(followUp.followUpDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {stats.upcomingFollowUps.length === 0 && (
              <div className="px-6 py-4 text-center text-gray-500">
                No upcoming follow-ups
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
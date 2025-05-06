'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Lead {
  _id: string;
  leadId: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  businessCategory: string;
  businessType: string;
  city: string;
  state: string;
  country: string;
  status: 'new' | 'contacted' | 'follow-up' | 'converted' | 'not-interested';
  priority: 'low' | 'medium' | 'high';
  source: string;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Add animation styles
const notificationStyles = {
  animation: 'fadeInOut 2s ease-in-out',
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [sortField, setSortField] = useState<keyof Lead>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [copyNotification, setCopyNotification] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const observer = useRef<IntersectionObserver>();

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-10px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const fetchLeads = async (pageNum: number = 1) => {
    try {
      const res = await fetch(`/api/leads?page=${pageNum}&limit=20`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error fetching leads');
      }

      if (pageNum === 1) {
        setLeads(data.leads);
      } else {
        setLeads(prev => [...prev, ...data.leads]);
      }
      
      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const lastLeadElementRef = useCallback((node: HTMLTableRowElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setLoadingMore(true);
        fetchLeads(page + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, page]);

  const handleSort = (field: keyof Lead) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedLeads = [...leads].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status: string) => {
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

  const getPriorityColor = (priority: string) => {
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyNotification('Copied to clipboard!');
    setTimeout(() => setCopyNotification(''), 2000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', file);
      
      // Get user data from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error('User data not found');
      }
      formData.append('userData', userData);

      const response = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import leads');
      }

      // Refresh the leads list
      fetchLeads(1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading leads
              </h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {copyNotification && (
        <div 
          className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50"
          style={notificationStyles}
        >
          {copyNotification}
        </div>
      )}
      
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all leads in your CRM system.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            {importing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importing...
              </>
            ) : (
              'Import Leads'
            )}
          </button>
          <Link
            href="/leads/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add lead
          </Link>
        </div>
      </div>
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('leadId')}
                  >
                    Lead ID {sortField === 'leadId' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('businessName')}
                  >
                    Business Name {sortField === 'businessName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('email')}
                  >
                    Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('phoneNumber')}
                  >
                    Phone {sortField === 'phoneNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('businessType')}
                  >
                    Business Type {sortField === 'businessType' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('country')}
                  >
                    Country {sortField === 'country' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('city')}
                  >
                    City {sortField === 'city' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sortedLeads.map((lead, index) => (
                  <tr 
                    key={`${lead._id}-${index}`}
                    ref={index === sortedLeads.length - 1 ? lastLeadElementRef : undefined}
                  >
                    <td 
                      className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 cursor-pointer hover:text-indigo-600 max-w-[150px] truncate"
                      onClick={() => copyToClipboard(lead.leadId)}
                      title="Click to copy ID"
                    >
                      {lead.leadId || '--- --- ---'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                      {lead.businessName || '--- --- ---'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                      {lead.email || '--- --- ---'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 max-w-[150px] truncate">
                      {lead.phoneNumber || '--- --- ---'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 max-w-[150px] truncate">
                      {lead.businessType || '--- --- ---'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 max-w-[150px] truncate">
                      {lead.country || '--- --- ---'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 max-w-[150px] truncate">
                      {lead.city || '--- --- ---'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loadingMore && (
              <div className="flex justify-center items-center py-4">
                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
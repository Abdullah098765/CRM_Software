'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import SearchResults from './SearchResults';
import { ILead } from '@/models/Lead';
import { ISegment } from '@/models/Segment';
import { ITask } from '@/models/Task';
import { Types } from 'mongoose';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    leads: (ILead & { _id: Types.ObjectId })[];
    segments: (ISegment & { _id: Types.ObjectId })[];
    tasks: (ITask & { _id: Types.ObjectId; leadId: { businessName: string } })[];
    pagination: {
      hasMore: boolean;
      page: number;
      total: number;
    };
  }>({ 
    leads: [], 
    segments: [], 
    tasks: [],
    pagination: {
      hasMore: false,
      page: 1,
      total: 0
    }
  });
  const [showResults, setShowResults] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear local storage
      localStorage.removeItem('user');
      
      // Show success message
      toast.success('Successfully logged out');
      
      // Redirect to authenticate page
      router.push('/authenticate');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&page=1`);
          const data = await response.json();
          setSearchResults(data);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
          toast.error('Failed to perform search');
        }
      } else {
        setSearchResults({ 
          leads: [], 
          segments: [], 
          tasks: [],
          pagination: {
            hasMore: false,
            page: 1,
            total: 0
          }
        });
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleLoadMore = async () => {
    if (loadingMore || !searchResults.pagination.hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = searchResults.pagination.page + 1;
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&page=${nextPage}`);
      const data = await response.json();

      setSearchResults(prev => ({
        ...prev,
        leads: [...prev.leads, ...data.leads],
        pagination: data.pagination
      }));
    } catch (error) {
      console.error('Error loading more results:', error);
      toast.error('Failed to load more results');
    } finally {
      setLoadingMore(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Leads', path: '/leads' },
    { name: 'Tasks', path: '/tasks' },
    { name: 'Segments', path: '/segments' },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/dashboard" className="text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors duration-200">
                CRM
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${
                    isActive(item.path)
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs relative" ref={searchRef}>
              <div className="relative flex items-center">
                <input
                  type="text"
                  className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-background-secondary text-text-primary placeholder-text-muted focus:outline-none focus:placeholder-text-muted focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm"
                  placeholder="Search leads, segments, tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  className="search-icon h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              {showResults && (
                <SearchResults
                  results={searchResults}
                  onClose={() => setShowResults(false)}
                  onLoadMore={handleLoadMore}
                  loadingMore={loadingMore}
                />
              )}
            </div>
          </div>

          {/* Logout Button */}
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden" id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`${
                isActive(item.path)
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              {item.name}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
          >
            <div className="flex items-center">
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
} 
import { useRouter } from 'next/navigation';
import { useState, useRef, useCallback, useEffect } from 'react';
import { ILead } from '@/models/Lead';
import { ISegment } from '@/models/Segment';
import { ITask } from '@/models/Task';
import { Types } from 'mongoose';
import { SearchResult } from '@/types/search';

interface SearchResultsProps {
  results: SearchResult;
  onClose: () => void;
  onLoadMore: () => void;
  loadingMore?: boolean;
}

export default function SearchResults({ results, onClose, onLoadMore, loadingMore = false }: SearchResultsProps) {
  const router = useRouter();
  const [localResults, setLocalResults] = useState<SearchResult>(results);
  const observer = useRef<IntersectionObserver>();
  const lastLeadElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalResults(results);
  }, [results]);

  const lastLeadElementCallback = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && results.pagination.hasMore) {
        onLoadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loadingMore, results.pagination.hasMore, onLoadMore]);

  const handleClick = (type: string, id: string) => {
    router.push(`/${type}/${id}`);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="absolute top-full right-0 w-[1000px] bg-white rounded-lg shadow-lg border border-gray-200 mt-1 max-h-[90vh] overflow-hidden">
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Search Results</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Segments Section */}
        {localResults.segments.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-500 mb-4">Segments</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {localResults.segments.map((segment: ISegment & { _id: Types.ObjectId }, index: number) => (
                <div
                  key={segment._id.toString()}
                  onClick={() => handleClick('segments', segment._id.toString())}
                  className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">
                      <span className="text-gray-400 mr-2">#{index + 1}</span>
                      {segment.name}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">{segment.description}</div>
                  <div className="mt-1 flex items-center text-xs text-gray-400">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {segment.leadCount} leads
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Section */}
        {localResults.tasks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-500 mb-4">Tasks</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {localResults.tasks.map((task: ITask & { _id: Types.ObjectId; leadId: { businessName: string } }, index: number) => (
                <div
                  key={task._id.toString()}
                  onClick={() => handleClick('tasks', task._id.toString())}
                  className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">
                      <span className="text-gray-400 mr-2">#{index + 1}</span>
                      {task.title}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{task.leadId.businessName}</span>
                      <span>•</span>
                      <span>Assigned to {task.assignedTo.name}</span>
                    </div>
                    {task.dueDate && (
                      <div className="mt-1 flex items-center text-xs text-gray-400">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leads Section with Infinite Scroll */}
        {localResults.leads.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-500 mb-4">Leads</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {localResults.leads.map((lead: ILead & { _id: Types.ObjectId }, index: number) => (
                <div
                  key={lead._id.toString()}
                  ref={index === localResults.leads.length - 1 ? lastLeadElementCallback : undefined}
                  onClick={() => handleClick('leads', lead._id.toString())}
                  className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">
                      <span className="text-gray-400 mr-2">#{index + 1}</span>
                      {lead.businessName}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span>{lead.contactPerson}</span>
                      <span>•</span>
                      <span>{lead.email}</span>
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-400">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {lead.city}, {lead.state}
                    </div>
                  </div>
                </div>
              ))}
              {loadingMore && (
                <div className="flex justify-center py-2">
                  <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}

        {localResults.segments.length === 0 && 
         localResults.tasks.length === 0 && 
         localResults.leads.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No results found
          </div>
        )}
      </div>
    </div>
  );
} 
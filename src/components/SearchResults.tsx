import { useRouter } from 'next/navigation';
import { ILead } from '@/models/Lead';
import { ISegment } from '@/models/Segment';
import { ITask } from '@/models/Task';
import { Types } from 'mongoose';

interface SearchResultsProps {
  results: {
    leads: (ILead & { _id: Types.ObjectId })[];
    segments: (ISegment & { _id: Types.ObjectId })[];
    tasks: (ITask & { _id: Types.ObjectId; leadId: { businessName: string } })[];
  };
  onClose: () => void;
}

export default function SearchResults({ results, onClose }: SearchResultsProps) {
  const router = useRouter();

  const handleClick = (type: string, id: string) => {
    onClose();
    router.push(`/${type}/${id}`);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'follow-up': 'bg-purple-100 text-purple-800',
      'converted': 'bg-green-100 text-green-800',
      'not-interested': 'bg-red-100 text-red-800',
      'pending': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="absolute right-0 mt-2 w-[32rem] bg-white rounded-lg shadow-xl z-50 border border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {results.leads.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <svg className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-sm font-semibold text-gray-900">Leads</h3>
              </div>
              <div className="space-y-2">
                {results.leads.map((lead) => (
                  <div
                    key={lead._id.toString()}
                    onClick={() => handleClick('leads', lead._id.toString())}
                    className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 transition-colors duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{lead.businessName}</div>
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
              </div>
            </div>
          )}

          {results.segments.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <svg className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <h3 className="text-sm font-semibold text-gray-900">Segments</h3>
              </div>
              <div className="space-y-2">
                {results.segments.map((segment) => (
                  <div
                    key={segment._id.toString()}
                    onClick={() => handleClick('segments', segment._id.toString())}
                    className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 transition-colors duration-150"
                  >
                    <div className="font-medium text-gray-900">{segment.name}</div>
                    <div className="mt-1 text-sm text-gray-500">{segment.description}</div>
                    <div className="mt-2 flex items-center text-xs text-gray-400">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {segment.leadCount} leads
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.tasks.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <svg className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-sm font-semibold text-gray-900">Tasks</h3>
              </div>
              <div className="space-y-2">
                {results.tasks.map((task) => (
                  <div
                    key={task._id.toString()}
                    onClick={() => handleClick('tasks', task._id.toString())}
                    className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 transition-colors duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{task.title}</div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
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

          {results.leads.length === 0 && results.segments.length === 0 && results.tasks.length === 0 && (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">Try different keywords or check your spelling.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
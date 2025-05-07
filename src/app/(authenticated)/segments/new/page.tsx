'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

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

// Define types for business categories and types
type BusinessCategory = typeof BUSINESS_CATEGORIES[number];
type BusinessTypes = {
  [key in BusinessCategory]: string[];
};

const BUSINESS_TYPES: BusinessTypes = {
  'Home Services': [
    'Plumbing',
    'Electrical',
    'HVAC/AC Repair',
    'Roofing',
    'Carpentry',
    'Painting',
    'Cleaning Services',
    'Landscaping',
    'Pest Control',
    'Appliance Repair',
    'Locksmith',
    'Moving Services',
    'Window Installation',
    'Flooring Installation',
    'Home Security'
  ],
  'Automotive': [
    'Auto Repair',
    'Auto Detailing',
    'Tire Shop',
    'Auto Body Shop',
    'Car Wash',
    'Auto Parts Store',
    'Towing Service',
    'Auto Glass Repair',
    'Mechanic Shop',
    'Auto Electronics'
  ],
  'Health & Wellness': [
    'Fitness Center',
    'Yoga Studio',
    'Massage Therapy',
    'Chiropractic',
    'Physical Therapy',
    'Nutrition Counseling',
    'Personal Training',
    'Wellness Center',
    'Alternative Medicine',
    'Health Food Store'
  ],
  'Food & Beverage': [
    'Restaurant',
    'Cafe',
    'Bakery',
    'Food Truck',
    'Catering',
    'Ice Cream Shop',
    'Coffee Shop',
    'Pizza Place',
    'Food Delivery',
    'Specialty Food Store'
  ],
  'Professional Services': [
    'Accounting',
    'Legal Services',
    'Tax Preparation',
    'Insurance Agency',
    'Real Estate Agency',
    'Consulting',
    'Marketing Agency',
    'Web Design',
    'Graphic Design',
    'Photography Studio'
  ],
  'Retail': [
    'Clothing Store',
    'Gift Shop',
    'Jewelry Store',
    'Electronics Store',
    'Bookstore',
    'Pet Store',
    'Hardware Store',
    'Furniture Store',
    'Antique Shop',
    'Thrift Store'
  ],
  'Construction': [
    'General Contractor',
    'Home Builder',
    'Remodeling',
    'Kitchen & Bath',
    'Deck & Patio',
    'Masonry',
    'Drywall',
    'Concrete Work',
    'Demolition',
    'Home Inspection'
  ],
  'Education & Training': [
    'Tutoring',
    'Music Lessons',
    'Dance Studio',
    'Art Classes',
    'Language School',
    'Driving School',
    'Computer Training',
    'Cooking Classes',
    'Swimming Lessons',
    'Sports Training'
  ],
  'Beauty & Personal Care': [
    'Hair Salon',
    'Barber Shop',
    'Nail Salon',
    'Spa',
    'Tanning Salon',
    'Tattoo Parlor',
    'Beauty Supply',
    'Makeup Artist',
    'Hair Removal',
    'Personal Styling'
  ],
  'Other': [
    'Other Small Business'
  ]
};

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

const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  disabled = false
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div
        className={`relative ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          <div className="flex flex-wrap gap-1">
            {selected.length > 0 ? (
              selected.map(option => (
                <span
                  key={option}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {option}
                  <button
                    type="button"
                    className="ml-1 text-indigo-600 hover:text-indigo-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(option);
                    }}
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <svg
            className={`h-5 w-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto">
          <div className="py-1">
            {options.map(option => (
              <div
                key={option}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${selected.includes(option) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}
                onClick={() => toggleOption(option)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    readOnly
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                  />
                  {option}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface Country {
  code: string;
  name: string;
  states: string[];
  majorCities: string[];
}

export default function NewSegmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<{ email: string; name: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    filterCriteria: {
      status: [] as string[],
      priority: [] as string[],
      businessCategory: [] as BusinessCategory[],
      businessType: [] as string[],
      location: {
        country: [] as string[],
        state: [] as string[],
        city: [] as string[],
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
      search: '',
    },
  });
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [leadsCount, setLeadsCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchUsers();
    setCurrentUser(JSON.parse(localStorage.getItem("user") || "{}"))
    fetchCountries();
  }, []);

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

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries');
      if (!response.ok) {
        throw new Error('Failed to fetch countries');
      }
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!currentUser) {
      setError('User information is required');
      setIsLoading(false);
      return;
    }

    try {
      const segmentData = {
        name: formData.name,
        description: formData.description,
        filterCriteria: {
          status: formData.filterCriteria.status,
          priority: formData.filterCriteria.priority,
          businessCategory: formData.filterCriteria.businessCategory,
          businessType: formData.filterCriteria.businessType,
          location: {
            city: formData.filterCriteria.location.city,
            state: formData.filterCriteria.location.state,
            country: formData.filterCriteria.location.country,
          },
          serviceInterest: formData.filterCriteria.serviceInterest,
          websiteStatus: formData.filterCriteria.websiteStatus,
          source: formData.filterCriteria.source,
          createdBy: formData.filterCriteria.createdBy,
          isArchived: formData.filterCriteria.isArchived,
          hasEmptyEmail: formData.filterCriteria.hasEmptyEmail,
          hasEmptyPhone: formData.filterCriteria.hasEmptyPhone,
          followUpDate: {
            from: formData.filterCriteria.followUpDate.from,
            to: formData.filterCriteria.followUpDate.to,
          },
          createdAt: {
            from: formData.filterCriteria.createdAt.from,
            to: formData.filterCriteria.createdAt.to,
          },
          search: searchValue,
        },
      };

      const response = await fetch('/api/segments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user': JSON.stringify(currentUser)
        },
        body: JSON.stringify(segmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create segment');
      }

      router.push('/segments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create segment');
      console.error('Error creating segment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get filtered business types based on selected categories
  const getFilteredBusinessTypes = () => {
    if (formData.filterCriteria.businessCategory.length === 0) {
      return [];
    }
    
    const selectedTypes = new Set<string>();
    formData.filterCriteria.businessCategory.forEach(category => {
      const types = BUSINESS_TYPES[category];
      if (types) {
        types.forEach(type => {
          selectedTypes.add(type);
        });
      }
    });
    
    return Array.from(selectedTypes).sort();
  };

  // Get filtered states based on selected countries
  const getFilteredStates = () => {
    if (formData.filterCriteria.location.country.length === 0) return [];
    
    const selectedCountries = countries.filter(country => 
      formData.filterCriteria.location.country.includes(country.name)
    );
    
    const allStates = selectedCountries.flatMap(country => country.states);
    return [...new Set(allStates)].sort();
  };

  // Get filtered cities based on selected countries
  const getFilteredCities = () => {
    if (formData.filterCriteria.location.country.length === 0) return [];
    
    const selectedCountries = countries.filter(country => 
      formData.filterCriteria.location.country.includes(country.name)
    );
    
    const allCities = selectedCountries.flatMap(country => country.majorCities);
    return [...new Set(allCities)].sort();
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setLeadsCount(0);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(`/api/leads/search-count?query=${encodeURIComponent(searchValue)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search leads');
      }

      setLeadsCount(data.leadsCount);
    } catch (error) {
      console.error('Error searching leads:', error);
      toast.error('Failed to search leads');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Search Leads</h2>
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by business name, contact person, email, etc."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isSearching ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {leadsCount > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {leadsCount} leads matched for "{searchValue}"
                </p>
              )}
            </div>
            <div className="bg-white shadow-sm rounded-lg relative">
              {/* Close button */}
              <button
                onClick={() => router.push('/segments')}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="px-4 py-5 sm:p-6">
                <div className="md:flex md:items-center md:justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                      Create New Segment
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Define a new segment by setting up filter criteria for your leads.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                  {/* Basic Information Section */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Segment Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filter Criteria Section */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Filter Criteria
                    </h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <MultiSelectDropdown
                        label="Status"
                        options={STATUS_OPTIONS}
                        selected={formData.filterCriteria.status}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          filterCriteria: { ...prev.filterCriteria, status: value }
                        }))}
                      />

                      <MultiSelectDropdown
                        label="Priority"
                        options={PRIORITY_OPTIONS}
                        selected={formData.filterCriteria.priority}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          filterCriteria: { ...prev.filterCriteria, priority: value }
                        }))}
                      />

                      <MultiSelectDropdown
                        label="Business Category"
                        options={BUSINESS_CATEGORIES}
                        selected={formData.filterCriteria.businessCategory}
                        onChange={(value) => {
                          setFormData(prev => ({
                            ...prev,
                            filterCriteria: {
                              ...prev.filterCriteria,
                              businessCategory: value as BusinessCategory[],
                              businessType: [],
                            },
                          }));
                        }}
                      />

                      <MultiSelectDropdown
                        label="Business Type"
                        options={getFilteredBusinessTypes()}
                        selected={formData.filterCriteria.businessType}
                        onChange={(value) => {
                          setFormData(prev => ({
                            ...prev,
                            filterCriteria: {
                              ...prev.filterCriteria,
                              businessType: value,
                            },
                          }));
                        }}
                        placeholder={formData.filterCriteria.businessCategory.length === 0 
                          ? "Select business categories first" 
                          : "Select business types..."}
                      />

                      <MultiSelectDropdown
                        label="Service Interest"
                        options={SERVICE_INTEREST_OPTIONS}
                        selected={formData.filterCriteria.serviceInterest}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          filterCriteria: { ...prev.filterCriteria, serviceInterest: value }
                        }))}
                      />

                      <MultiSelectDropdown
                        label="Website Status"
                        options={WEBSITE_STATUS_OPTIONS}
                        selected={formData.filterCriteria.websiteStatus}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          filterCriteria: { ...prev.filterCriteria, websiteStatus: value }
                        }))}
                      />

                      <MultiSelectDropdown
                        label="Source"
                        options={SOURCE_OPTIONS}
                        selected={formData.filterCriteria.source}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          filterCriteria: { ...prev.filterCriteria, source: value }
                        }))}
                      />

                      <MultiSelectDropdown
                        label="Created By"
                        options={users.map(user => user.email)}
                        selected={formData.filterCriteria.createdBy}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          filterCriteria: { ...prev.filterCriteria, createdBy: value }
                        }))}
                      />

                      <div className="sm:col-span-2">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="isArchived"
                              name="isArchived"
                              checked={formData.filterCriteria.isArchived}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                filterCriteria: { ...prev.filterCriteria, isArchived: e.target.checked }
                              }))}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isArchived" className="ml-2 block text-sm text-gray-900">
                              Archived Leads
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="hasEmptyEmail"
                              name="hasEmptyEmail"
                              checked={formData.filterCriteria.hasEmptyEmail}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                filterCriteria: { ...prev.filterCriteria, hasEmptyEmail: e.target.checked }
                              }))}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="hasEmptyEmail" className="ml-2 block text-sm text-gray-900">
                              Empty Email
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="hasEmptyPhone"
                              name="hasEmptyPhone"
                              checked={formData.filterCriteria.hasEmptyPhone}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                filterCriteria: { ...prev.filterCriteria, hasEmptyPhone: e.target.checked }
                              }))}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="hasEmptyPhone" className="ml-2 block text-sm text-gray-900">
                              Empty Phone
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Follow-up Date From</label>
                          <input
                            type="date"
                            id="followUpDateFrom"
                            name="followUpDateFrom"
                            value={formData.filterCriteria.followUpDate.from}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              filterCriteria: {
                                ...prev.filterCriteria,
                                followUpDate: { ...prev.filterCriteria.followUpDate, from: e.target.value }
                              }
                            }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Follow-up Date To</label>
                          <input
                            type="date"
                            id="followUpDateTo"
                            name="followUpDateTo"
                            value={formData.filterCriteria.followUpDate.to}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              filterCriteria: {
                                ...prev.filterCriteria,
                                followUpDate: { ...prev.filterCriteria.followUpDate, to: e.target.value }
                              }
                            }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Created At From</label>
                          <input
                            type="date"
                            id="createdAtFrom"
                            name="createdAtFrom"
                            value={formData.filterCriteria.createdAt.from}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              filterCriteria: {
                                ...prev.filterCriteria,
                                createdAt: { ...prev.filterCriteria.createdAt, from: e.target.value }
                              }
                            }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Created At To</label>
                          <input
                            type="date"
                            id="createdAtTo"
                            name="createdAtTo"
                            value={formData.filterCriteria.createdAt.to}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              filterCriteria: {
                                ...prev.filterCriteria,
                                createdAt: { ...prev.filterCriteria.createdAt, to: e.target.value }
                              }
                            }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <div className="space-y-4">
                          <div>
                            <MultiSelectDropdown
                              label="Countries"
                              options={countries.map(country => country.name)}
                              selected={formData.filterCriteria.location.country}
                              onChange={(values) => {
                                setFormData(prev => ({
                                  ...prev,
                                  filterCriteria: {
                                    ...prev.filterCriteria,
                                    location: {
                                      ...prev.filterCriteria.location,
                                      country: values,
                                      state: [], // Clear states when countries change
                                      city: [] // Clear cities when countries change
                                    }
                                  }
                                }));
                              }}
                              placeholder="Select countries"
                            />
                          </div>
                          
                          <div>
                            <MultiSelectDropdown
                              label="States"
                              options={getFilteredStates()}
                              selected={formData.filterCriteria.location.state}
                              onChange={(values) => {
                                setFormData(prev => ({
                                  ...prev,
                                  filterCriteria: {
                                    ...prev.filterCriteria,
                                    location: {
                                      ...prev.filterCriteria.location,
                                      state: values
                                    }
                                  }
                                }));
                              }}
                              placeholder={formData.filterCriteria.location.country.length === 0 ? "Select countries first" : "Select states"}
                              disabled={formData.filterCriteria.location.country.length === 0}
                            />
                          </div>
                          
                          <div>
                            <MultiSelectDropdown
                              label="Cities"
                              options={getFilteredCities()}
                              selected={formData.filterCriteria.location.city}
                              onChange={(values) => {
                                setFormData(prev => ({
                                  ...prev,
                                  filterCriteria: {
                                    ...prev.filterCriteria,
                                    location: {
                                      ...prev.filterCriteria.location,
                                      city: values
                                    }
                                  }
                                }));
                              }}
                              placeholder={formData.filterCriteria.location.country.length === 0 ? "Select countries first" : "Select cities"}
                              disabled={formData.filterCriteria.location.country.length === 0}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isLoading
                          ? 'bg-indigo-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                      {isLoading ? 'Creating...' : 'Create Segment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
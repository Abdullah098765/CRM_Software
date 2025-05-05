'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Country {
  code: string;
  name: string;
  states: string[];
  majorCities: string[];
}

interface LocationState {
  country: string;
  state: string;
  city: string;
  customCity: string;
}

interface BusinessState {
  businessCategory: string;
  businessType: string;
  source: string;
}

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

const BUSINESS_TYPES = {
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

const SOURCES = [
  'Google Maps',
  'Yelp',
  'Yellow Pages',
  'Facebook',
  'Instagram',
  'LinkedIn',
  'Referral',
  'Website',
  'Direct Call',
  'Email',
  'Trade Show',
  'Local Chamber of Commerce',
  'Industry Directory',
  'Other'
];

export default function NewLeadPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [states, setStates] = useState<string[]>([]);
  const [majorCities, setMajorCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [customCity, setCustomCity] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedBusinessCategory, setSelectedBusinessCategory] = useState<string>('');
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('Google Maps');

  // Load saved data from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem('leadLocation');
    const savedBusiness = localStorage.getItem('leadBusiness');
    
    if (savedLocation) {
      const location: LocationState = JSON.parse(savedLocation);
      setSelectedCountry(location.country);
      setSelectedCity(location.city);
      setCustomCity(location.customCity);
      setSelectedState(location.state);
    }

    if (savedBusiness) {
      const business: BusinessState = JSON.parse(savedBusiness);
      setSelectedBusinessCategory(business.businessCategory);
      setSelectedBusinessType(business.businessType);
      setSelectedSource(business.source || 'Google Maps');
    }
  }, []);

  // Load countries data and handle saved location
  useEffect(() => {
    fetch('/api/countries')
      .then(res => res.json())
      .then(data => {
        setCountries(data);
        // If we have a saved country, load its states and cities
        const savedLocation = localStorage.getItem('leadLocation');
        if (savedLocation) {
          const location: LocationState = JSON.parse(savedLocation);
          const country = data.find((c: Country) => c.code === location.country);
          if (country) {
            setStates(country.states);
            setMajorCities(country.majorCities);
          }
        }
      })
      .catch(err => console.error('Error loading countries:', err));
  }, []);

  // Save location data to localStorage
  useEffect(() => {
    const locationData: LocationState = {
      country: '',
      state: '',
      city: '',
      customCity: ''
    };

    // Load existing location data if available
    const savedLocation = localStorage.getItem('leadLocation');
    if (savedLocation) {
      const saved = JSON.parse(savedLocation);
      Object.assign(locationData, saved);
    }

    // Update country if selected
    if (selectedCountry) {
      locationData.country = selectedCountry;
    }

    // Update state if selected
    if (selectedState) {
      locationData.state = selectedState;
    }

    // Update city if selected or custom city entered
    if (selectedCity) {
      locationData.city = selectedCity;
      locationData.customCity = ''; // Clear custom city when selecting from dropdown
    } else if (customCity) {
      locationData.customCity = customCity;
      locationData.city = ''; // Clear selected city when using custom city
    }

    // Only save if we have at least one field with data
    if (Object.values(locationData).some(value => value !== '')) {
      localStorage.setItem('leadLocation', JSON.stringify(locationData));
    }
  }, [selectedCountry, selectedState, selectedCity, customCity]);

  // Save business data to localStorage
  useEffect(() => {
    const businessData: BusinessState = {
      businessCategory: '',
      businessType: '',
      source: ''
    };

    // Load existing business data if available
    const savedBusiness = localStorage.getItem('leadBusiness');
    if (savedBusiness) {
      const saved = JSON.parse(savedBusiness);
      Object.assign(businessData, saved);
    }

    // Update business category if selected
    if (selectedBusinessCategory) {
      businessData.businessCategory = selectedBusinessCategory;
    }

    // Update business type if selected
    if (selectedBusinessType) {
      businessData.businessType = selectedBusinessType;
    }

    // Update source if selected
    if (selectedSource) {
      businessData.source = selectedSource;
    }

    // Only save if we have at least one field with data
    if (Object.values(businessData).some(value => value !== '')) {
      localStorage.setItem('leadBusiness', JSON.stringify(businessData));
    }
  }, [selectedBusinessCategory, selectedBusinessType, selectedSource]);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    const country = countries.find(c => c.code === countryCode);
    setStates(country?.states || []);
    setMajorCities(country?.majorCities || []);
    setSelectedCity(''); // Reset city selection when country changes
    setCustomCity(''); // Reset custom city when country changes
    setSelectedState(''); // Reset state selection when country changes
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (city !== 'other') {
      setCustomCity(''); // Clear custom city when selecting from dropdown
    }
  };

  const handleCustomCityChange = (city: string) => {
    setCustomCity(city);
  };

  const handleBusinessCategoryChange = (category: string) => {
    setSelectedBusinessCategory(category);
    setSelectedBusinessType(''); // Reset business type when category changes
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get form data
      const formData = new FormData(e.currentTarget);
      const formDataObj = {
        businessName: formData.get('businessName') as string,
        contactPerson: formData.get('contactPerson') as string,
        phoneNumber: formData.get('phoneNumber') as string,
        email: formData.get('email') as string,
        businessCategory: formData.get('businessCategory') as string,
        businessType: formData.get('businessType') as string,
        websiteUrl: formData.get('websiteUrl') as string,
        status: formData.get('status') as string,
        priority: formData.get('priority') as string,
        source: formData.get('source') as string,
        serviceInterest: formData.get('serviceInterest') as string,
        websiteStatus: formData.get('websiteStatus') as string,
        notes: formData.get('notes') as string
      };

      // Get user info from localStorage
      const userInfo = localStorage.getItem('user');
      if (!userInfo) {
        throw new Error('User information not found');
      }
      const user = JSON.parse(userInfo);

      // Validate that either email or phone number is provided
      if (!formDataObj.email && !formDataObj.phoneNumber) {
        throw new Error('Either email or phone number must be provided');
      }

      // Get the selected country data
      const selectedCountryData = countries.find(c => c.code === selectedCountry);
      if (!selectedCountryData) {
        throw new Error('Please select a valid country');
      }

      // Prepare location data
      const locationData = {
        country: selectedCountryData.name,
        state: selectedState,
        city: selectedCity === 'other' ? customCity : selectedCity
      };

      // Validate location data
      if (!locationData.country || !locationData.state || !locationData.city) {
        throw new Error('Please fill in all location fields');
      }

      console.log('Location Data:', locationData);

      const leadData = {
        ...formDataObj,
        user,
        ...locationData
      };

      console.log('Full Lead Data:', leadData);

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save lead');
      }

      router.push('/leads');
    } catch (err: any) {
      setError(err.message);
      console.error('Error saving lead:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg relative">
            {/* Close button */}
            <button
              onClick={() => router.push('/leads')}
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
                    Create New Lead
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Fill in the details below to create a new lead in your CRM system.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                {/* Business Information Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        id="businessName"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>


                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        id="phoneNumber"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                  

                    <div>
                      <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                        Contact Person
                      </label>
                      <input
                        type="text"
                        name="contactPerson"
                        id="contactPerson"
                        
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
                        Website URL
                      </label>
                      <input
                        type="url"
                        name="websiteUrl"
                        id="websiteUrl"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="businessCategory" className="block text-sm font-medium text-gray-700">
                        Business Category *
                      </label>
                      <select
                        id="businessCategory"
                        name="businessCategory"
                        required
                        value={selectedBusinessCategory}
                        onChange={(e) => handleBusinessCategoryChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">Select a category</option>
                        {BUSINESS_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                        Business Type *
                      </label>
                      <select
                        id="businessType"
                        name="businessType"
                        required
                        value={selectedBusinessType}
                        onChange={(e) => setSelectedBusinessType(e.target.value)}
                        disabled={!selectedBusinessCategory}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">Select a business type</option>
                        {selectedBusinessCategory && BUSINESS_TYPES[selectedBusinessCategory as keyof typeof BUSINESS_TYPES]?.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Location Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Location
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country *
                      </label>
                      <select
                        id="country"
                        name="country"
                        required
                        value={selectedCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">Select a country</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State/Province *
                      </label>
                      <select
                        id="state"
                        name="state"
                        required
                        disabled={!selectedCountry}
                        value={selectedState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">Select a state/province</option>
                        {states.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City *
                      </label>
                      {selectedCity === 'other' ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            id="city"
                            name="city"
                            required
                            value={customCity}
                            onChange={(e) => handleCustomCityChange(e.target.value)}
                            placeholder="Enter city name"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCity('');
                              setCustomCity('');
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-500"
                          >
                            ← Back to city list
                          </button>
                        </div>
                      ) : (
                        <select
                          id="city"
                          name="city"
                          required
                          value={selectedCity}
                          onChange={(e) => handleCityChange(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">Select a city</option>
                          {majorCities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                          <option value="other">Other (enter manually)</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lead Details Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Lead Details
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status *
                      </label>
                      <select
                        id="status"
                        name="status"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="converted">Converted</option>
                        <option value="not-interested">Not Interested</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                        Priority *
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                        Source *
                      </label>
                      <select
                        id="source"
                        name="source"
                        required
                        value={selectedSource}
                        onChange={(e) => setSelectedSource(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        {SOURCES.map((source) => (
                          <option key={source} value={source}>
                            {source}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="serviceInterest" className="block text-sm font-medium text-gray-700">
                        Service Interest
                      </label>
                      <input
                        type="text"
                        name="serviceInterest"
                        id="serviceInterest"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="websiteStatus" className="block text-sm font-medium text-gray-700">
                        Website Status
                      </label>
                      <input
                        type="text"
                        name="websiteStatus"
                        id="websiteStatus"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-sm text-gray-500">
                        Please provide either an email address or a phone number
                      </p>
                    </div>
                  </div>
                </div>

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
                    disabled={loading}
                    className={`inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      loading
                        ? 'bg-indigo-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {loading ? 'Creating...' : 'Create Lead'}
                  </button>
                </div>

                {error && (
                  <div className="error-message">
                    <div className="error-message-icon">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="error-message-text">{error}</div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
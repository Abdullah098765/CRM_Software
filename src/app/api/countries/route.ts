import { NextResponse } from 'next/server';

// List of countries with their states/provinces and major cities
const countries = [
  {
    code: 'US',
    name: 'United States',
    states: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
      'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
      'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
      'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
      'Wisconsin', 'Wyoming'
    ],
    majorCities: [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
      'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus',
      'San Francisco', 'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Boston'
    ]
  },
  {
    code: 'CA',
    name: 'Canada',
    states: [
      'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
      'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
      'Quebec', 'Saskatchewan', 'Yukon'
    ],
    majorCities: [
      'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg',
      'Quebec City', 'Hamilton', 'Kitchener'
    ]
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    states: [
      'England', 'Scotland', 'Wales', 'Northern Ireland'
    ],
    majorCities: [
      'London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Edinburgh', 'Bristol',
      'Cardiff', 'Belfast', 'Leicester'
    ]
  },
  {
    code: 'AU',
    name: 'Australia',
    states: [
      'Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland',
      'South Australia', 'Tasmania', 'Victoria', 'Western Australia'
    ],
    majorCities: [
      'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle',
      'Canberra', 'Wollongong', 'Hobart'
    ]
  },
  {
    code: 'IN',
    name: 'India',
    states: [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
      'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
      'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
      'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ],
    majorCities: [
      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune',
      'Ahmedabad', 'Jaipur', 'Lucknow'
    ]
  },
  {
    code: 'FR',
    name: 'France',
    states: [
      'Île-de-France', 'Auvergne-Rhône-Alpes', 'Hauts-de-France', 'Provence-Alpes-Côte d\'Azur',
      'Occitanie', 'Nouvelle-Aquitaine', 'Grand Est', 'Pays de la Loire', 'Bretagne',
      'Normandie', 'Bourgogne-Franche-Comté', 'Centre-Val de Loire', 'Corse'
    ],
    majorCities: [
      'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg',
      'Montpellier', 'Bordeaux', 'Lille'
    ]
  },
  {
    code: 'DE',
    name: 'Germany',
    states: [
      'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
      'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia',
      'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt',
      'Schleswig-Holstein', 'Thuringia'
    ],
    majorCities: [
      'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf',
      'Leipzig', 'Dortmund', 'Essen'
    ]
  },
  {
    code: 'RU',
    name: 'Russia',
    states: [
      'Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod',
      'Kazan', 'Chelyabinsk', 'Omsk', 'Samara', 'Rostov-on-Don'
    ],
    majorCities: [
      'Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod',
      'Kazan', 'Chelyabinsk', 'Omsk', 'Samara', 'Rostov-on-Don'
    ]
  },
  {
    code: 'SG',
    name: 'Singapore',
    states: [
      'Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region'
    ],
    majorCities: [
      'Singapore', 'Jurong', 'Woodlands', 'Tampines', 'Serangoon', 'Bedok',
      'Bukit Merah', 'Bukit Timah', 'Geylang', 'Kallang'
    ]
  },
  {
    code: 'PK',
    name: 'Pakistan',
    states: [
      'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory',
      'Gilgit-Baltistan', 'Azad Kashmir'
    ],
    majorCities: [
      'Karachi', 'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Hyderabad', 'Gujranwala',
      'Peshawar', 'Quetta', 'Islamabad', 'Sialkot', 'Bahawalpur', 'Sargodha', 'Sukkur',
      'Larkana', 'Sheikhupura', 'Rahim Yar Khan', 'Jhang', 'Mardan', 'Gujrat'
    ]
  }
].sort((a, b) => a.name.localeCompare(b.name));

export async function GET() {
  return NextResponse.json(countries);
} 
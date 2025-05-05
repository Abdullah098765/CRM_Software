import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Lead } from '@/models/Lead';
import * as XLSX from 'xlsx';

interface ImportRow {
  [key: string]: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userDataStr = formData.get('userData') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userDataStr) {
      return NextResponse.json(
        { error: 'User data not provided' },
        { status: 400 }
      );
    }

    const userData = JSON.parse(userDataStr);

    // Read the file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet) as ImportRow[];

    // Connect to database
    await connectDB();

    // Get the current count of leads
    const currentCount = await Lead.countDocuments();

    // Validate required fields
    const requiredFields = [
      'Business Name',
      'Business Category'
    ];

    const validationErrors = [];
    const validLeads = [];

    for (const [index, row] of data.entries()) {
      const rowNumber = index + 2;
      const missingFields = requiredFields.filter(field => {
        const value = row[field] || row[field.toLowerCase()] || row[field.replace(/\s+/g, '')];
        return !value || value.trim() === '';
      });

      if (missingFields.length > 0) {
        validationErrors.push({
          row: rowNumber,
          missingFields: missingFields
        });
        continue;
      }

      // Generate sequential leadId
      const leadId = String(currentCount + index + 1).padStart(7, '0');

      validLeads.push({
        leadId,
        businessName: row['Business Name'] || row['businessName'] || '',
        email: row['Email'] || row['email'] || '',
        phoneNumber: row['Phone'] || row['phoneNumber'] || row['Phone Number'] || '',
        businessType: row['Business Type'] || row['businessType'] || 'Other',
        businessCategory: row['Business Category'] || row['businessCategory'] || '',
        websiteUrl: row['Website'] || row['WebsiteUrl'] || '',
        country: row['Country'] || row['country'] || '',
        city: row['City'] || row['city'],
        state: row['State'] || row['state'] || row['States'],
        status: 'new',
        priority: 'medium',
        source: 'import',
        createdBy: {
          name: userData.name || 'Unknown User',
          email: userData.email || 'unknown@email.com',
          id: userData.id || 'unknown'
        }
      });
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({
        error: 'Validation failed',
        details: {
          totalRows: data.length,
          validRows: validLeads.length,
          invalidRows: validationErrors.length,
          errors: validationErrors.map(err => ({
            row: err.row,
            message: `Missing required fields: ${err.missingFields.join(', ')}`
          }))
        }
      }, { status: 400 });
    }

    if (validLeads.length === 0) {
      return NextResponse.json({
        error: 'No valid leads found in the file'
      }, { status: 400 });
    }

    // Insert valid leads into database
    const result = await Lead.insertMany(validLeads);

    return NextResponse.json({
      message: 'Leads imported successfully',
      count: result.length,
      details: {
        totalProcessed: data.length,
        successfullyImported: result.length
      }
    });

  } catch (error: any) {
    console.error('Error importing leads:', error);
    return NextResponse.json(
      { 
        error: 'Failed to import leads',
        details: error.message
      },
      { status: 500 }
    );
  }
} 
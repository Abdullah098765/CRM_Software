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
    const requiredFields = ['Business Name'];

    const validationErrors = [];
    const validLeads = [];

    for (const [index, row] of data.entries()) {
      const rowNumber = index + 2;
      const missingFields = requiredFields.filter(field => {
        const value = row[field] || row[field.toLowerCase()] || row[field.replace(/\s+/g, '')];
        console.log(value,index);
        return !value || String(value).trim() === '';
      });

      if (missingFields.length > 0) {
        validationErrors.push({
          row: rowNumber,
          message: `Missing required field: ${missingFields.join(', ')}`
        });
        continue;
      }

      // Generate sequential leadId
      const leadId = String(currentCount + index + 1).padStart(7, '0');

      validLeads.push({
        leadId,
        businessName: row['Business Name'] || row['businessName'] || row['business name'] || '',
        email: row['Email'] || row['email'] || '',
        phoneNumber: row['Phone'] || row['phoneNumber'] || row['Phone Number'] || row['phone number'] || row['phone'] || '',
        contactPerson: row['username'] || row['Username'] || row['name'] || row['Name'] || row['Contact Person'] || row['Full Name'] || row['First Name'] || '',
        businessType: row['Business Type'] || row['businessType'] || row['business type'] || 'Other',
        businessCategory: row['Business Category'] || row['businessCategory'] || row['business category'] || '',
        websiteUrl: row['Website'] || row['WebsiteUrl'] || row['website'] || '',
        country: row['Country'] || row['country'] || '',
        city: row['City'] || row['city'] || '',
        state: row['State'] || row['state'] || row['States'] || '',
        status: 'new',
        priority: 'low',
        source: 'import',
        createdBy: {
          name: userData.name || 'Unknown User',
          email: userData.email || 'unknown@email.com',
          id: userData.id || 'unknown'
        }
      });
    }

    // If there are no valid leads at all
    if (validLeads.length === 0) {
      return NextResponse.json({
        error: 'No valid leads found in the file',
        details: {
          totalRows: data.length,
          validRows: 0,
          invalidRows: validationErrors.length,
          errors: validationErrors
        }
      }, { status: 400 });
    }

    // Insert valid leads into database
    const result = await Lead.insertMany(validLeads);

    // Return success response with validation details
    return NextResponse.json({
      message: 'Leads imported successfully',
      details: {
        totalRows: data.length,
        successfullyImported: result.length,
        failedRows: validationErrors.length,
        errors: validationErrors
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
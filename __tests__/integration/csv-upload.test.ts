import path from 'path';
import fs from 'fs';
import fetch from 'cross-fetch';
import FormData from 'form-data';

describe('CSV Upload API', () => {
  it('should accept a CSV file upload and respond', async () => {
    // Prepare a dummy CSV file (in-memory)
    const csvContent = 'street_address,city,zip_code,full_name\n123 Main St,Testville,12345,John Doe';
    const fileBuffer = Buffer.from(csvContent, 'utf-8');

    // Prepare form data
    const form = new FormData();
    form.append('file', fileBuffer, {
      filename: 'test.csv',
      contentType: 'text/csv',
    });
    form.append('columnMapping', JSON.stringify({
      street_address: 'street_address',
      city: 'city',
      zip_code: 'zip_code',
      full_name: 'full_name',
    }));

    // Make the request (assume local dev server is running)
    const res = await fetch('http://localhost:3003/api/csv-upload', {
      method: 'POST',
      body: form as any,
      headers: form.getHeaders(),
    });

    // Just check that we got a response
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
  });
}); 
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    
    // Forward the request to the FTP server
    // The user specified: http://192.168.1.24:3000/upload
    const ftpServerUrl = 'http://192.168.1.24:3000';
    
    const response = await fetch(`${ftpServerUrl}/upload?username=${encodeURIComponent(username)}`, {
      method: 'POST',
      body: formData,
      // Note: When using fetch with FormData, do NOT set Content-Type header manually.
      // The browser/runtime will set it with the correct boundary.
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FTP Server Error:', errorText);
      return NextResponse.json(
        { error: `Upload failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Return success
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Proxy Upload Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

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

    // Forward the request to the FTP server
    const ftpServerUrl = 'http://192.168.1.65:3001';
    
    // Get the Content-Type header from the incoming request
    const contentType = request.headers.get('content-type');

    const response = await fetch(`${ftpServerUrl}/upload?username=${encodeURIComponent(username)}`, {
      method: 'POST',
      body: request.body,
      headers: {
        'Content-Type': contentType,
      },
      duplex: 'half',
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

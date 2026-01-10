// src/app/api/generate-jwt/route.js
export async function POST(request) {
  try {
    const body = await request.json();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is not defined');
      return new Response(JSON.stringify({ error: 'Server configuration error: NEXT_PUBLIC_SUPABASE_URL missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('SUPABASE_ANON_KEY is not defined');
      return new Response(JSON.stringify({ error: 'Server configuration error: SUPABASE_ANON_KEY missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    console.log('Forwarding to Supabase Edge Function:', `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-jwt`, 'Body:', body);
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-jwt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Supabase Edge Function error:', data);
      return new Response(JSON.stringify({ error: data.error || `Supabase Edge Function failed: ${response.statusText}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API route error:', error.message);
    return new Response(JSON.stringify({ error: `Server error: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code') || '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const resp = await fetch(`https://worldfactbook.io/api/v1/countries/${code.toLowerCase()}/`);
    if (resp.ok) {
      const data = await resp.json();
      const history = data.background || data.history || data.introduction?.background || '';
      if (history) return new Response(JSON.stringify({ history }), { headers: corsHeaders });
    }
  } catch (e) {}

  return new Response(JSON.stringify({ 
    history: 'History is being prepared for this country. Explore its flag and facts for now!' 
  }), { headers: corsHeaders });
}

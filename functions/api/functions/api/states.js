export async function onRequest(context) {
  const { env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  const { results } = await env.DB.prepare('SELECT * FROM states ORDER BY name').all();
  return new Response(JSON.stringify(results || []), { headers: corsHeaders });
}

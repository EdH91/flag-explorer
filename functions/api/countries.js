const FAMOUS_COUNTRIES = [
  'US','GB','FR','DE','IT','JP','CN','IN','BR','CA','AU','RU','MX','ES','KR',
  'ZA','EG','NG','KE','AR','CL','SE','NO','FI','NL','BE','CH','AT','PL','TR',
  'SA','AE','ID','TH','VN','PH','MY','SG','NZ','IE','PT','GR','DK','CZ','HU',
  'IL','IR','PK','BD','UA'
];

export async function onRequest(context) {
  const { env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  const { results } = await env.DB.prepare(
    'SELECT code, name, capital, continent, population, languages, flag_png, flag_svg, lat, lng, is_famous, quiz_completed FROM countries ORDER BY name'
  ).all();

  if (results && results.length > 0) {
    return new Response(JSON.stringify(results), { headers: corsHeaders });
  }

  const resp = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,capital,region,subregion,population,languages,flags,latlng');
  const data = await resp.json();

  const countries = data.map(c => ({
    code: c.cca2,
    name: c.name.common,
    official_name: c.name.official,
    capital: c.capital?.[0] || 'N/A',
    continent: c.region || 'Unknown',
    region: c.subregion || '',
    population: c.population || 0,
    languages: c.languages ? Object.values(c.languages) : [],
    flag_png: c.flags?.png || '',
    flag_svg: c.flags?.svg || '',
    lat: c.latlng?.[0] || 0,
    lng: c.latlng?.[1] || 0,
    is_famous: FAMOUS_COUNTRIES.includes(c.cca2) ? 1 : 0
  }));

  for (const c of countries) {
    await env.DB.prepare(`
      INSERT OR REPLACE INTO countries 
      (code, name, official_name, capital, continent, region, population, languages, flag_png, flag_svg, lat, lng, is_famous)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      c.code, c.name, c.official_name, c.capital, c.continent, c.region,
      c.population, JSON.stringify(c.languages), c.flag_png, c.flag_svg,
      c.lat, c.lng, c.is_famous
    ).run();
  }

  return new Response(JSON.stringify(countries), { headers: corsHeaders });
}

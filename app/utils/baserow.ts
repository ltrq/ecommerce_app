// app/utils/baserow.ts
const API_URL = import.meta.env.VITE_BASEROW_API_URL;
const API_TOKEN = import.meta.env.VITE_BASEROW_API_TOKEN;

export async function fetchAllProducts() {
  if (!API_URL || !API_TOKEN) {
    throw new Response('API config missing', { status: 500 });
  }

  const response = await fetch(API_URL, {
    method: 'GET',
    headers: { Authorization: `Token ${API_TOKEN}` },
  });

  if (!response.ok) {
    throw new Response('Failed to fetch products', { status: response.status });
  }

  const data = await response.json();
  // Ensure data.results exists, default to empty array if undefined
  return { results: data.results || [] };
}

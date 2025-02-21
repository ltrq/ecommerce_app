import type { Route } from '../+types/root';

interface Product {
  id: string;
  itemName: string;
  Price: number;
  Description: string;
  ItemSize: string;
  Color: string;
  image: string;
}

const API_URL = process.env.BASEROW_API_URL;
const API_TOKEN = process.env.BASEROW_API_TOKEN;

export async function loader({ params }: { params: { id: string } }) {
  const productId = params.id;

  if (!API_URL || !API_TOKEN) {
    throw new Response('API config missing', { status: 500 });
  }

  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      Authorization: `Token ${API_TOKEN}`,
    },
  });

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    return { productId: 'No item available' };
  }

  const foundProduct = data.results.find((product: Product) => {
    if (product.itemName) {
      const normalizedProductName = product.itemName
        .toLowerCase()
        .replace(/\s+/g, '-');
      return normalizedProductName === productId?.toLowerCase();
    }
    return false;
  });

  return {
    productId: foundProduct ? `${foundProduct.itemName}` : `Item not found`,
  };
}

export function meta({ data }: { data?: { productId?: string } }) {
  return [
    { title: data?.productId || 'E-commerce Shop' },
    { name: 'description', content: 'Welcome to Your E-commerce Shop' },
  ];
}

export default function ProductView({
  loaderData,
}: {
  loaderData: { productId: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] bg-background text-center">
      <div className="flex flex-col items-center gap-4 text-6xl">
        <div>{loaderData.productId}</div>
      </div>
    </div>
  );
}

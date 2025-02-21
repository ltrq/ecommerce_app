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

export async function clientLoader({ params }: Route.LoaderArgs) {
  const productId = params.id;
  const response = await fetch(
    'https://api.baserow.io/api/database/rows/table/434214/?user_field_names=true',
    {
      method: 'GET',
      headers: {
        Authorization: `Token wnQ8NonCztQMMH6Dk3BxBUiyDe2jf1Dt`,
      },
    }
  );

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    return { productId: 'no item available' };
  }

  const foundProduct = data.results.find((product: Product) => {
    if (product.itemName) {
      const normalizedProductName = product.itemName
        .toLowerCase()
        .replace(/\s+/g, '-');
      const normalizedId = productId?.toLowerCase();
      return normalizedProductName === normalizedId;
    }
    return false;
  });

  return {
    productId: foundProduct
      ? `Product "${foundProduct.itemName}" found in the database`
      : `Item "${productId}" not found`,
  };
}

export default function ProductView({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] bg-background text-center">
      <div className="flex flex-col items-center gap-4 text-6xl">
        <br></br>
        <div>{loaderData.productId}</div>
      </div>
    </div>
  );
}

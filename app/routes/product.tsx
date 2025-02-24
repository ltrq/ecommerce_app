import { useLoaderData } from 'react-router';
import { useState } from 'react';
import { fetchAllProducts } from '../utils/baserow';

interface Product {
  id: number;
  itemName: string;
  price: number;
  description: string;
  itemSize: string;
  color: string;
  image?: string;
}

interface ProductGroup {
  itemName: string;
  variants: Product[];
  sizes: string[];
  colors: string[];
}

type LoaderData = ProductGroup | { productId: string };

function transformBaserowProductGroup(
  products: Record<string, any>[]
): ProductGroup {
  const variants = products.map((raw) => ({
    id: raw.id,
    itemName: raw.itemName || 'Unknown Item',
    price: parseFloat(raw.Price) || 0,
    description: raw.Description || 'No description',
    itemSize: raw.ItemSize || 'N/A',
    color: raw.Color || 'N/A',
    image: raw.ImageURL1,
  }));
  return {
    itemName: variants[0]?.itemName || 'Unknown Item',
    variants,
    sizes: [...new Set(variants.map((v) => v.itemSize))],
    colors: [...new Set(variants.map((v) => v.color))],
  };
}

function filterAndTransformProducts(data: any, productId: string): LoaderData {
  if (!data.results?.length) {
    return { productId: 'No items available' };
  }

  const matchingProducts = data.results.filter(
    (product: Record<string, any>) => {
      const name = product.itemName;
      return (
        typeof name === 'string' &&
        name.toLowerCase().replace(/\s+/g, '-') === productId.toLowerCase()
      );
    }
  );

  return matchingProducts.length > 0
    ? transformBaserowProductGroup(matchingProducts)
    : { productId: 'Item not found' };
}

// New function to handle variant options
function getVariantOptions(
  variants: Product[],
  selectedSize: string | null,
  selectedColor: string | null
) {
  const validColors = selectedSize
    ? [
        ...new Set(
          variants
            .filter((v) => v.itemSize === selectedSize)
            .map((v) => v.color)
        ),
      ]
    : [...new Set(variants.map((v) => v.color))];

  const validSizes = selectedColor
    ? [
        ...new Set(
          variants
            .filter((v) => v.color === selectedColor)
            .map((v) => v.itemSize)
        ),
      ]
    : [...new Set(variants.map((v) => v.itemSize))];

  const currentVariant =
    selectedSize && selectedColor
      ? variants.find(
          (v) => v.itemSize === selectedSize && v.color === selectedColor
        )
      : null;

  return { validColors, validSizes, currentVariant };
}

export function meta({ data }: { data: LoaderData }) {
  const title = 'itemName' in data ? data.itemName : 'E-commerce Shop';
  const desc =
    'itemName' in data
      ? `View details for ${data.itemName}`
      : 'Welcome to our shop';
  return [{ title }, { name: 'description', content: desc }];
}

export async function loader({ params }: { params: { id: string } }) {
  const productId = params.id;
  const data = await fetchAllProducts();
  return filterAndTransformProducts(data, productId);
}

export default function ProductView() {
  const data = useLoaderData() as LoaderData;

  if ('productId' in data && !('itemName' in data)) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background text-center">
        <div className="flex flex-col items-center gap-4 text-6xl">
          {data.productId}
        </div>
      </div>
    );
  }

  const product = data as ProductGroup;
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const { validColors, validSizes, currentVariant } = getVariantOptions(
    product.variants,
    selectedSize,
    selectedColor
  );

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] bg-background text-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-6xl font-bold">{product.itemName}</h1>
        <p className="text-2xl">
          {product.variants[0]?.description || 'No description'}
        </p>

        <div className="flex gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              className={`px-4 py-2 rounded ${
                selectedSize === size ? 'bg-blue-500 text-white' : 'bg-gray-200'
              } ${
                !validSizes.includes(size)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              onClick={() =>
                setSelectedSize(size === selectedSize ? null : size)
              }
              disabled={!validSizes.includes(size)}
            >
              {size}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {product.colors.map((color) => (
            <button
              key={color}
              className={`px-4 py-2 rounded ${
                selectedColor === color
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              } ${
                !validColors.includes(color)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              onClick={() =>
                setSelectedColor(color === selectedColor ? null : color)
              }
              disabled={!validColors.includes(color)}
            >
              {color}
            </button>
          ))}
        </div>

        {currentVariant && (
          <div className="flex flex-col gap-2 text-xl">
            <p>Price: ${currentVariant.price.toFixed(2)}</p>
            {currentVariant.image && (
              <img
                src={currentVariant.image}
                alt={currentVariant.itemName}
                className="max-w-xs"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

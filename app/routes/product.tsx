// app/routes/ProductView.tsx
import { useLoaderData } from 'react-router';
import { useState } from 'react';
import { fetchAllProducts } from '../utils/firebase-utilsFunc'; // Will be updated to Firestore
import { auth } from '../utils/firebase'; // Adjust the import path

// Define product interface based on Firestore structure
interface Product {
  imgURL1?: string; // Optional, as not all products have all image URLs
  imgURL2?: string;
  imgURL3?: string;
  itemName: string;
  stockQuantity: number;
  price: number;
  averageRating: string | number; // Can be string or number based on your data
  material: string;
  itemID: number;
  subCategoryID: string;
  color: string;
  saleStartDate?: any; // Timestamp or null/undefined
  updatedAt?: any; // Timestamp or empty string
  dimension: string;
  status: string;
  reviewCount: string | number; // Can be string or number
  saleEndDate?: any; // Timestamp or empty string
  createdAt?: any; // Timestamp or empty string
  discount: number;
  categoryID: string;
  isOnSale: boolean;
  itemSize: string;
  description: string;
  SKU: string;
}

interface ProductGroup {
  itemName: string;
  variants: Product[];
  sizes: string[];
  colors: string[];
}

type LoaderData = ProductGroup | { productId: string };

// app/routes/ProductView.tsx (partial, updated transformFirestoreProductGroup)
function transformFirestoreProductGroup(products: Product[]): ProductGroup {
  const variants = products.map((raw) => ({
    imgURL1: raw.imgURL1,
    imgURL2: raw.imgURL2,
    imgURL3: raw.imgURL3, // Include all image URLs
    itemName: raw.itemName || 'Unknown Item',
    price: raw.price || 0, // Use 'price' instead of 'Price' to match Firestore
    averageRating: raw.averageRating || 'N/A',
    material: raw.material || 'N/A',
    itemID: raw.itemID || 0,
    subCategoryID: raw.subCategoryID || 'N/A',
    color: raw.color || 'N/A',
    saleStartDate: raw.saleStartDate,
    updatedAt: raw.updatedAt,
    dimension: raw.dimension || 'N/A',
    status: raw.status || 'N/A',
    reviewCount: raw.reviewCount || 'N/A',
    saleEndDate: raw.saleEndDate,
    createdAt: raw.createdAt,
    discount: raw.discount || 0,
    categoryID: raw.categoryID || 'N/A',
    isOnSale: raw.isOnSale || false,
    itemSize: raw.itemSize || 'N/A',
    description: raw.description || 'No description',
    SKU: raw.SKU || 'N/A',
    stockQuantity: raw.stockQuantity || 0, // Add stockQuantity to match the Product interface
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

  const matchingProducts = data.results.filter((product: Product) => {
    const name = product.itemName;
    return (
      typeof name === 'string' &&
      name.toLowerCase().replace(/\s+/g, '-') === productId.toLowerCase()
    );
  });

  return matchingProducts.length > 0
    ? transformFirestoreProductGroup(matchingProducts)
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
            {currentVariant.imgURL1 && ( // Use imgURL1 as the primary image, falling back to others if needed
              <img
                src={currentVariant.imgURL1}
                alt={currentVariant.itemName}
                className="max-w-xs"
                onError={(e) => {
                  if (currentVariant.imgURL2) {
                    (e.target as HTMLImageElement).src = currentVariant.imgURL2;
                  } else if (currentVariant.imgURL3) {
                    (e.target as HTMLImageElement).src = currentVariant.imgURL3;
                  }
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

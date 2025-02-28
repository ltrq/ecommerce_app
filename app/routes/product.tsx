import { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router';
import { useProducts } from '../context/productContext';

// Define product interface based on Firestore structure
interface Product {
  imgURL1?: string;
  imgURL2?: string;
  imgURL3?: string;
  itemName: string;
  stockQuantity: number;
  price: number;
  averageRating: string | number;
  material: string;
  itemID: number;
  subCategoryID: string;
  color: string;
  saleStartDate?: any;
  updatedAt?: any;
  dimension: string;
  status: string;
  reviewCount: string | number;
  saleEndDate?: any;
  createdAt?: any;
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

type LoaderData = { productId: string };

function transformFirestoreProductGroup(products: Product[]): ProductGroup {
  const variants = products.map((raw) => ({
    imgURL1: raw.imgURL1,
    imgURL2: raw.imgURL2,
    imgURL3: raw.imgURL3,
    itemName: raw.itemName || 'Unknown Item',
    price: raw.price || 0,
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
    stockQuantity: raw.stockQuantity || 0,
  }));
  return {
    itemName: variants[0]?.itemName || 'Unknown Item',
    variants,
    sizes: [...new Set(variants.map((v) => v.itemSize))],
    colors: [...new Set(variants.map((v) => v.color))],
  };
}

function filterAndTransformProducts(
  products: Product[],
  productId: string
): ProductGroup | { productId: string } {
  if (!products?.length) {
    return { productId: 'No items available' };
  }

  const matchingProducts = products.filter((product: Product) => {
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

// Handle variant options
function getVariantOptions(
  variants: Product[],
  selectedSize: string | null,
  selectedColor: string | null
) {
  if (!variants || !Array.isArray(variants)) {
    return { validColors: [], validSizes: [], currentVariant: null };
  }

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

export function meta({ data }: { data: any }) {
  const title = 'itemName' in data ? data.itemName : 'E-commerce Shop';
  const desc =
    'itemName' in data
      ? `View details for ${data.itemName}`
      : 'Welcome to our shop';
  return [{ title }, { name: 'description', content: desc }];
}

// Update loader to only handle params
export async function loader({ params }: { params: { id: string } }) {
  return { productId: params.id };
}

export default function ProductView() {
  const { productId } = useLoaderData() as LoaderData;
  const { products, isLoading, error } = useProducts();
  const [product, setProduct] = useState<ProductGroup | { productId: string }>({
    productId: 'Loading...',
  });
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Filter products based on productId when products are loaded
  useEffect(() => {
    if (!isLoading && !error && products.length > 0) {
      const filteredProduct = filterAndTransformProducts(products, productId);
      setProduct(filteredProduct);
    } else if (error) {
      setProduct({ productId: error });
    }
  }, [products, productId, isLoading, error]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background text-center">
        <div className="flex flex-col items-center gap-4 text-6xl">
          'Loading...'
        </div>
      </div>
    );
  }

  if ('productId' in product && product.productId !== 'Loading...') {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background text-center">
        <div className="flex flex-col items-center gap-4 text-6xl">
          {product.productId}
        </div>
      </div>
    );
  }

  // Type guard to ensure productGroup.variants exists and isn’t empty
  if (
    !('variants' in product) ||
    !product.variants ||
    product.variants.length === 0
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background text-center">
        <div className="flex flex-col items-center gap-4 text-6xl">
          'No variants available for this product'
        </div>
      </div>
    );
  }

  const productGroup = product as ProductGroup;
  const { validColors, validSizes, currentVariant } = getVariantOptions(
    productGroup.variants,
    selectedSize,
    selectedColor
  );

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] bg-background text-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-6xl font-bold">{productGroup.itemName}</h1>
        <p className="text-2xl">
          {productGroup.variants[0]?.description || 'No description'}
        </p>

        <div className="flex gap-2">
          {productGroup.sizes.map((size) => (
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
          {productGroup.colors.map((color) => (
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
            {currentVariant.imgURL1 && (
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

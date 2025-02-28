// app/utils/productService.ts
import { useState, useEffect, useCallback } from 'react';
import { fetchAllProducts } from './firebase-utilsFunc'; // Adjust the import path
import { auth } from './firebase'; // Adjust the import path

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
  validColors: string[];
  validSizes: string[];
  currentVariant: Product | null;
}

type LoaderData = ProductGroup | { productId: string };

// Transformation and utility functions
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
    validColors: [...new Set(variants.map((v) => v.color))],
    validSizes: [...new Set(variants.map((v) => v.itemSize))],
    currentVariant: null,
  };
}

function filterAndTransformProducts(data: any, productId: string): LoaderData {
  if (!data.results?.length) {
    return { productId: 'No items available' };
  }

  const normalizedProductId = productId.toLowerCase().replace(/[-_]/g, ''); // Handle hyphens and underscores
  const matchingProducts = data.results.filter((product: Product) => {
    // const name = product.itemName;
    const name = 'Slim Fit Shirt';
    console.log('name', name);
    console.log('productId', productId);
    if (typeof name !== 'string') return false;
    const normalizedName = name.toLowerCase().replace(/\s+|-/g, ''); // Remove spaces and hyphens
    // return normalizedName === normalizedProductId;
    return 'found';
  });

  return matchingProducts.length > 0
    ? transformFirestoreProductGroup(matchingProducts)
    : { productId: 'Item not found' };
}

// Update getVariantOptions to ensure currentVariant is Product | null, not undefined
function getVariantOptions(
  product: ProductGroup,
  selectedSize: string | null,
  selectedColor: string | null
): ProductGroup {
  const validColors = selectedSize
    ? [
        ...new Set(
          product.variants
            .filter((v) => v.itemSize === selectedSize)
            .map((v) => v.color)
        ),
      ]
    : product.colors;

  const validSizes = selectedColor
    ? [
        ...new Set(
          product.variants
            .filter((v) => v.color === selectedColor)
            .map((v) => v.itemSize)
        ),
      ]
    : product.sizes;

  let currentVariant: Product | null = null;
  if (selectedSize && selectedColor) {
    currentVariant =
      product.variants.find(
        (v) => v.itemSize === selectedSize && v.color === selectedColor
      ) || null; // Explicitly return null if no match
  }

  return {
    ...product,
    validColors,
    validSizes,
    currentVariant,
  };
}

// Custom hook for Product service, accepting productId
export function useProductService(productId: string) {
  const [product, setProduct] = useState<LoaderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const productData = await fetchAllProducts();
      const loadedProduct = filterAndTransformProducts(productData, productId);
      setProduct(loadedProduct);
    } catch (error) {
      console.error('Failed to load product:', error);
      setProduct({ productId: 'Error loading product' });
    } finally {
      setIsLoading(false);
    }
  }, [productId]); // Added productId as dependency

  // Load product on mount or when productId changes
  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // Handle size selection
  const handleSizeSelect = useCallback(
    (size: string | null) => {
      setSelectedSize(size);
      if (product && 'itemName' in product) {
        setProduct(
          getVariantOptions(product, size, selectedColor) as LoaderData
        );
      }
    },
    [product, selectedColor]
  );

  // Handle color selection
  const handleColorSelect = useCallback(
    (color: string | null) => {
      setSelectedColor(color);
      if (product && 'itemName' in product) {
        setProduct(
          getVariantOptions(product, selectedSize, color) as LoaderData
        );
      }
    },
    [product, selectedSize]
  );

  return {
    product: product && 'itemName' in product ? product : null,
    handleSizeSelect,
    handleColorSelect,
    isLoading,
  };
}

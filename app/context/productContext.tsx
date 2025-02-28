// app/context/productContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { fetchAllProducts } from '../utils/firebase-utilsFunc';

// Define product interface based on Firestore structure
export interface Product {
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

interface ProductContextValue {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => void; // For updates (e.g., after AdminPanel changes)
}

const ProductContext = createContext<ProductContextValue | undefined>(
  undefined
);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllProducts();
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid product data structure');
      }
      setProducts(data.results as Product[]);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProducts([]); // Fallback to empty array for non-authenticated reads
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const refreshProducts = () => {
    fetchProducts(); // Trigger a re-fetch for updates (e.g., after AdminPanel changes)
  };

  const value = {
    products,
    isLoading,
    error,
    refreshProducts,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}

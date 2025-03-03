// app/context/cartContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { type Product } from '../context/productContext'; // Match Product interface

interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

// Simplified Product interface for AI prompts (matching AIchatbot-prompts.ts)
interface AIProduct {
  itemName: string;
  Price: number;
  Color: string;
  ItemSize: string;
}

interface CartContextValue {
  cartItems: CartItem[];
  addToCart: (
    product: Product,
    size: string,
    color: string,
    quantity?: number
  ) => Promise<void>;
  removeItem: (product: Product, size: string, color: string) => void;
  increaseQuantity: (product: Product, size: string, color: string) => void;
  decreaseQuantity: (product: Product, size: string, color: string) => void;
  clearCart: () => void;
  totalQuantity: number;
  isLoading: boolean;
  error: string | null;
  getCartJson: () => string; // Function that returns a string, not a string itself
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCart = async (
    product: Product,
    size: string,
    color: string,
    quantity = 1
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      if (product.stockQuantity < quantity) {
        throw new Error('Insufficient stock');
      }
      setCartItems((prev) => {
        const existingItem = prev.find(
          (item) =>
            item.product.itemID === product.itemID &&
            item.size === size &&
            item.color === color
        );
        if (existingItem) {
          return prev.map((item) =>
            item.product.itemID === product.itemID &&
            item.size === size &&
            item.color === color
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, quantity, size, color }];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = (product: Product, size: string, color: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.itemID === product.itemID &&
            item.size === size &&
            item.color === color
          )
      )
    );
  };

  const increaseQuantity = (product: Product, size: string, color: string) => {
    const existingItem = cartItems.find(
      (item) =>
        item.product.itemID === product.itemID &&
        item.size === size &&
        item.color === color
    );
    if (existingItem) {
      addToCart(product, size, color, 1);
    }
  };

  const decreaseQuantity = (product: Product, size: string, color: string) => {
    const existingItem = cartItems.find(
      (item) =>
        item.product.itemID === product.itemID &&
        item.size === size &&
        item.color === color
    );
    if (existingItem && existingItem.quantity > 1) {
      addToCart(product, size, color, -1);
    } else if (existingItem) {
      removeItem(product, size, color);
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Transform CartItem to match AIchatbot-prompts.ts Product interface (capitalized fields)
  const transformCartItemToProduct = (cartItem: CartItem): AIProduct => ({
    itemName: cartItem.product.itemName,
    Price: cartItem.product.price,
    Color: cartItem.product.color,
    ItemSize: cartItem.size, // Use size from CartItem, not product.itemSize (since CartItem.size may differ)
  });

  // Get cart as JSON for AI prompts, including quantity for context
  const getCartJson = useMemo(() => {
    const cartProducts = cartItems.map((item) => ({
      ...transformCartItemToProduct(item),
      Quantity: item.quantity, // Add quantity for AI context
    }));
    return () => JSON.stringify(cartProducts); // Return a function that returns the string
  }, [cartItems]);

  // Persist cart to localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart) as CartItem[];
      setCartItems(parsedCart);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    isLoading,
    error,
    getCartJson, // Pass the function, not the string
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export type { CartItem, AIProduct }; // Export CartItem and AIProduct for type safety in other files

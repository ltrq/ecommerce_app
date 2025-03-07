// app/context/cartContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import axios from 'axios';
import { type Product } from '../context/productContext';
import { useUser } from '../context/userContext';
import debounce from 'lodash/debounce';

interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

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
  getCartJson: () => string;
}

interface CartUpdateRequest {
  cart: CartItem[];
  userId: string;
  email: string;
  timestamp: Date;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_SYNCCART_URL;
const FETCH_CART_URL = import.meta.env.VITE_BACKEND_API_FETCHCART_URL;

// Refactored getIdToken to accept user and email as parameters
const getIdToken = async (user: any, email: string | null) => {
  if (!user || !email) {
    throw new Error('User not authenticated or email not available');
  }
  try {
    const idToken = await user.getIdToken();
    return idToken;
  } catch (error) {
    console.error('Error fetching ID token:', error);
    throw new Error('Failed to get ID token');
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, email } = useUser(); // Use hooks at the top level

  // Fetch cart from Firestore when user logs in
  useEffect(() => {
    const fetchCartFromFirestore = async () => {
      if (!user || !email) {
        console.log('No user logged in, clearing cart');
        setCartItems([]); // Clear cart if no user is logged in
        return;
      }

      try {
        setIsLoading(true);
        const token = await getIdToken(user, email);
        const response = await axios.get(FETCH_CART_URL, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const fetchedCart = response.data.cart || [];
        setCartItems(fetchedCart);
      } catch (err) {
        setError(
          axios.isAxiosError(err) && err.response
            ? `Failed to fetch cart: ${err.response.data?.error || err.message}`
            : 'Failed to fetch cart from backend'
        );
        console.error('Error fetching cart from backend:', err);
        setCartItems([]); // Reset cart on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartFromFirestore();
  }, [user, email]); // Run whenever user or email changes (i.e., on login/logout)

  const sendCartUpdateToBackend = debounce(async (cartItems: CartItem[]) => {
    if (!user || !email) {
      console.log(
        'User not authenticated or email not available, skipping backend cart update'
      );
      return;
    }
    try {
      const token = await getIdToken(user, email);
      const response = await axios.post(
        BACKEND_API_URL,
        {
          cart: cartItems,
          userId: user.uid,
          email: email,
          timestamp: new Date(),
        } as CartUpdateRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setError(null); // Clear error on success
      console.log('Cart update sent to backend:', response.data);
    } catch (err) {
      setError(
        axios.isAxiosError(err) && err.response
          ? `Backend error: ${err.response.data?.error || err.message}`
          : 'Failed to update cart on backend'
      );
      console.error('Error sending cart update to backend:', err);
    }
  }, 500);

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
          const updatedItems = prev.map((item) =>
            item.product.itemID === product.itemID &&
            item.size === size &&
            item.color === color
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          sendCartUpdateToBackend(updatedItems);
          return updatedItems;
        }
        const newItems = [...prev, { product, quantity, size, color }];
        sendCartUpdateToBackend(newItems);
        return newItems;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = (product: Product, size: string, color: string) => {
    setCartItems((prev) => {
      const updatedItems = prev.filter(
        (item) =>
          !(
            item.product.itemID === product.itemID &&
            item.size === size &&
            item.color === color
          )
      );
      sendCartUpdateToBackend(updatedItems);
      return updatedItems;
    });
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
    setCartItems((prev) => {
      const updatedItems: CartItem[] = [];
      sendCartUpdateToBackend(updatedItems);
      return updatedItems;
    });
  };

  const transformCartItemToProduct = (cartItem: CartItem): AIProduct => ({
    itemName: cartItem.product.itemName,
    Price: cartItem.product.price,
    Color: cartItem.product.color,
    ItemSize: cartItem.size,
  });

  const getCartJson = useMemo(() => {
    const cartProducts = cartItems.map((item) => ({
      ...transformCartItemToProduct(item),
      Quantity: item.quantity,
    }));
    return () => JSON.stringify(cartProducts);
  }, [cartItems]);

  // Removed localStorage logic
  // useEffect(() => {
  //   const savedCart = localStorage.getItem('cart');
  //   if (savedCart) {
  //     const parsedCart = JSON.parse(savedCart) as CartItem[];
  //     setCartItems(parsedCart);
  //   }
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem('cart', JSON.stringify(cartItems));
  //   sendCartUpdateToBackend(cartItems);
  // }, [cartItems]);

  // Only send updates to backend when cartItems change
  useEffect(() => {
    sendCartUpdateToBackend(cartItems);
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
    getCartJson,
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

export type { CartItem, AIProduct, CartUpdateRequest };

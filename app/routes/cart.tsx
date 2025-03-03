// app/components/Cart.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, type CartItem } from '../context/cartContext'; // Import CartItem for type safety
import { useUser } from '../context/userContext'; // Import useUser for auth (or userContext if separate)
import { type Product } from '../context/productContext'; // Import Product for type checking

export default function Cart() {
  const {
    cartItems,
    addToCart,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    isLoading,
    error,
  } = useCart();
  const user = useUser(); // Check authentication for cart operations
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('');

  // Navigate to login if not authenticated and trying to modify cart
  useEffect(() => {
    if (!user && (cartItems.length > 0 || message)) {
      navigate('/login');
    }
  }, [user, cartItems.length, message, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading cart...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error loading cart: {error}
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-gray-600">
        <p className="text-2xl font-semibold">Your cart is empty</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-xl rounded-lg text-gray-800">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">
        Your Shopping Cart
      </h2>
      {message && <p className="mb-4 text-green-500">{message}</p>}
      {error && <p className="mb-4 text-red-500">{error}</p>}

      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={`${item.product.itemID}-${item.size}-${item.color}`}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-md"
          >
            <div className="flex items-center gap-4">
              {item.product.imgURL1 && (
                <img
                  src={item.product.imgURL1}
                  alt={item.product.itemName}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    if (item.product.imgURL2) {
                      (e.target as HTMLImageElement).src = item.product.imgURL2;
                    } else if (item.product.imgURL3) {
                      (e.target as HTMLImageElement).src = item.product.imgURL3;
                    }
                  }}
                />
              )}
              <div>
                <p className="text-lg font-medium">{item.product.itemName}</p>
                <p className="text-sm text-gray-500">
                  Size: {item.size} | Color: {item.color}
                </p>
                <p className="text-md font-semibold">
                  ${item.product.price.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  decreaseQuantity(item.product, item.size, item.color)
                }
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300"
                disabled={!user}
              >
                -
              </button>
              <span className="px-3">{item.quantity}</span>
              <button
                onClick={() =>
                  increaseQuantity(item.product, item.size, item.color)
                }
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-300"
                disabled={!user}
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.product, item.size, item.color)}
                className="ml-4 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                disabled={!user}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow-md">
        <p className="text-lg font-semibold">
          Total Quantity:{' '}
          {cartItems.reduce((sum, item) => sum + item.quantity, 0)} | Total
          Price: $
          {cartItems
            .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
            .toFixed(2)}
        </p>
      </div>

      <div className="mt-6 flex justify-between gap-4">
        <button
          onClick={clearCart}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
          disabled={!user || cartItems.length === 0}
        >
          Clear Cart
        </button>
        <button
          onClick={() => navigate('/checkout')} // Navigate to a checkout page (create if needed)
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          disabled={!user || cartItems.length === 0}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

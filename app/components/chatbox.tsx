// app/components/Chatbox.tsx (partial, focusing on messages state)
import { useState, useRef, useEffect } from 'react';
import { fetchAllProducts } from '../utils/firebase-utilsFunc'; // Adjust the import path if needed (should point to Firestore)
import {
  LTRQ_AIBotProductRecommendationPrompt,
  LTRQ_AIBotCartRecoveryPrompt,
  LTRQ_AIBotSupportPrompt,
  LTRQ_AIBotLeadGenPrompt,
  LTRQ_AIBotOrderSupportPrompt,
} from '../utils/AIchatbot-prompts'; // Adjust the import path if needed
import { auth } from '../utils/firebase'; // Adjust the import path

export default function Chatbox() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPopup, setShowPopup] = useState(true); // State for pop-up visibility
  const [messages, setMessages] = useState<
    { text: string; isUser: boolean; timestamp: Date; date?: Date }[] // Added date as optional
  >([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // State for Firestore products with updated structure
  const [products, setProducts] = useState<any[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

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

  // Keyword arrays for each prompt type
  const orderKeywords = ['order', 'status', 'track', 'shipment'];
  const cartKeywords = ['cart', 'abandon', 'buy', 'purchase'];
  const supportKeywords = ['help', 'support', 'return', 'returns'];
  const recommendationKeywords = ['recommend', 'looking', 'need', 'want'];
  const leadKeywords = ['name', 'email', 'lead', 'contact'];

  // Separate function to validate products
  function validateProducts(productsData: any[]): Product[] {
    const validatedProducts = productsData
      .map((product: any) => {
        if (
          !product.itemName ||
          !product.price ||
          !product.color ||
          !product.itemSize
        ) {
          return null;
        }
        return product as Product;
      })
      .filter((product): product is Product => product !== null);

    if (validatedProducts.length === 0) {
      throw new Error('No valid products found in Firestore');
    }

    return validatedProducts;
  }

  // New function to verify product data structure
  function verifyProductStructure(productData: any) {
    if (
      !productData ||
      !productData.results ||
      !Array.isArray(productData.results) ||
      productData.results.length === 0
    ) {
      console.warn(
        'No products or invalid data structure from Firestore:',
        productData
      );
      throw new Error(
        'No products found or invalid data structure in Firestore'
      );
    }
    return productData;
  }

  // Fetch Firestore products with enhanced debugging and validation
  useEffect(() => {
    // const unsubscribe = auth.onAuthStateChanged(async (user) => {
    //   console.log(
    //     'Auth state changed, user:',
    //     user ? 'Authenticated' : 'Not authenticated'
    //   );
    //   if (!user) {
    //     console.warn('User not authenticated, restricting product access');
    //     setProducts([]);
    //     setIsProductsLoading(false);
    //   } else {
    //     await loadProducts();
    //   }
    // });
    // return () => unsubscribe();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsProductsLoading(true);
    try {
      const productData = await fetchAllProducts();
      const verifiedData = verifyProductStructure(productData);
      const validatedProducts = validateProducts(verifiedData.results);
      setProducts(validatedProducts);
    } catch (error) {
      console.error('Failed to fetch products from Firestore:', error);
      setProducts([
        {
          itemName: 'Slim Fit Shirt',
          price: 29.99,
          color: 'Red',
          itemSize: 'S',
        },
      ]);
    } finally {
      setIsProductsLoading(false);
    }
  };

  // Show initial welcome message when chatbox is expanded
  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      const welcomeMessage = {
        text: 'Hello! I’m LTRQ AI, your personal shopping assistant. I can help you find stylish clothes, recover your cart, track orders, or answer questions. What can I assist you with today?',
        isUser: false,
        timestamp: new Date(),
        date: new Date(), // Added date field
      };
      setMessages([welcomeMessage]);
    }
    // Reset pop-up visibility when chatbox is closed
    if (!isExpanded) {
      setShowPopup(true);
    }
  }, [isExpanded, messages.length]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Determine which prompt to use based on keyword arrays, with validation
  const getPrompt = (userInput: string) => {
    if (!userInput.trim())
      return LTRQ_AIBotProductRecommendationPrompt(products);
    const lowerInput = userInput.toLowerCase();
    const words = lowerInput.split(/\s+/);

    if (!products || products.length === 0) {
      return LTRQ_AIBotProductRecommendationPrompt([]);
    }

    if (words.some((word) => orderKeywords.includes(word))) {
      return LTRQ_AIBotOrderSupportPrompt(products, userInput);
    } else if (words.some((word) => cartKeywords.includes(word))) {
      return LTRQ_AIBotCartRecoveryPrompt(products, userInput);
    } else if (words.some((word) => supportKeywords.includes(word))) {
      return LTRQ_AIBotSupportPrompt(products, userInput);
    } else if (words.some((word) => recommendationKeywords.includes(word))) {
      return LTRQ_AIBotProductRecommendationPrompt(products, userInput);
    } else if (words.some((word) => leadKeywords.includes(word))) {
      return LTRQ_AIBotLeadGenPrompt(products, userInput);
    }
    return LTRQ_AIBotProductRecommendationPrompt(products, userInput);
  };

  // Handle sending a message to OpenAI with full conversation history
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      isUser: true,
      timestamp: new Date(),
      date: new Date(), // Added date field
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (isProductsLoading || !products || products.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            text: 'Sorry, I can’t recommend products right now. Please try again later.',
            isUser: false,
            timestamp: new Date(),
            date: new Date(),
          },
        ]);
        setIsLoading(false);
        return;
      }

      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        throw new Error(
          'OpenAI API key is missing. Please check your .env file.'
        );
      }

      const conversationHistory = messages.map((msg) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text,
      }));

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: getPrompt(input) },
              ...conversationHistory,
              { role: 'user', content: input },
            ],
            max_tokens: 150,
          }),
        }
      );
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          text: data.choices[0].message.content,
          isUser: false,
          timestamp: new Date(),
          date: new Date(),
        },
      ]);
      setIsLoading(false);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: 'Sorry, something went wrong.',
          isUser: false,
          timestamp: new Date(),
          date: new Date(),
        },
      ]);
      setIsLoading(false);
    }
  };

  // Handle clicking the chat button to open and hide popup
  const handleChatToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setShowPopup(false); // Hide popup when opening chatbox
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-100">
      {/* Pop-up message when chatbox is closed */}
      {!isExpanded && showPopup && (
        <div className="absolute bottom-20 right-0 bg-yellow-200 text-black p-3 rounded-lg shadow-md max-w-xs h-20 w-200">
          <p className="text-sm">
            This AI chatbot is only for demo and only has a limited number of
            tokens. If runs out, please contact me at to get more tokens.
          </p>
          <div className="absolute -bottom-2 right-5 w-0 h-0 border-l-8 border-r-8 border-t-8 border-t-yellow-200 border-l-transparent border-r-transparent"></div>
        </div>
      )}

      <button
        onClick={handleChatToggle}
        className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600"
        aria-label={isExpanded ? 'Close chat' : 'Open chat'}
      >
        <span className="material-symbols-outlined">
          {isExpanded ? 'close' : 'chat'}
        </span>
      </button>

      {isExpanded && (
        <div className="absolute bottom-16 right-0 w-96 bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300">
          <div className="bg-gray-100 p-2 flex justify-between items-center">
            <h3 className="text-lg font-bold text-black">
              Demo E-commerce AI Chat
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close chat"
            >
              {/* <span className="material-symbols-outlined">close</span> */}
            </button>
          </div>
          <div className="h-80 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <p className="text-gray-500">Start a conversation...</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 ${msg.isUser ? 'text-right' : 'text-left'}`}
                >
                  <div className="flex flex-col">
                    <span
                      className={`inline-block p-2 rounded ${
                        msg.isUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-black'
                      }`}
                    >
                      {msg.text}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                      {msg.date && ` | Date: ${msg.date.toLocaleDateString()}`}{' '}
                      {/* Display date if present */}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-2 border-t">
            <form onSubmit={handleSend}>
              <div className="flex gap-2">
                <input
                  type="text"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded text-black"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

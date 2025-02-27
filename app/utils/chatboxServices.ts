// app/utils/chatboxService.ts
import { useState, useEffect, useCallback } from 'react';
import { fetchAllProducts } from './firebase-utilsFunc'; // Adjust the import path
import {
  LTRQ_AIBotProductRecommendationPrompt,
  LTRQ_AIBotCartRecoveryPrompt,
  LTRQ_AIBotSupportPrompt,
  LTRQ_AIBotLeadGenPrompt,
  LTRQ_AIBotOrderSupportPrompt,
} from './AIchatbot-prompts'; // Adjust the import path
import { auth } from './firebase'; // Adjust the import path

// Define product interface based on Firestore structure (matching AIchatbot-prompts.ts)
interface Product {
  itemName: string;
  Price: number; // Note: Capital 'P' to match AIchatbot-prompts.ts
  Color: string; // Capital 'C' to match
  ItemSize: string; // Capital 'I' to match
}

// Message type with date
interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  date?: Date;
}

// Keyword arrays for each prompt type
const orderKeywords = ['order', 'status', 'track', 'shipment'];
const cartKeywords = ['cart', 'abandon', 'buy', 'purchase'];
const supportKeywords = ['help', 'support', 'return', 'returns'];
const recommendationKeywords = ['recommend', 'looking', 'need', 'want'];
const leadKeywords = ['name', 'email', 'lead', 'contact'];

// Validation and verification functions
function validateProducts(productsData: any[]): Product[] {
  const validatedProducts = productsData
    .map((product: any) => {
      if (
        !product.itemName ||
        !product.Price ||
        !product.Color ||
        !product.ItemSize
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
    throw new Error('No products found or invalid data structure in Firestore');
  }
  return productData;
}

// Custom hook for Chatbox service
export function useChatboxService() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  // Load products from Firestore
  const loadProducts = useCallback(async () => {
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
          Price: 29.99, // Match AIchatbot-prompts.ts field name
          Color: 'Red', // Match AIchatbot-prompts.ts field name
          ItemSize: 'S', // Match AIchatbot-prompts.ts field name
        },
      ]);
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  // Initial product load (commented out auth check for simplicity, can be re-added)
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Show initial welcome message when chatbox is expanded
  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      const welcomeMessage: Message = {
        text: 'Hello! I’m LTRQ AI, your personal shopping assistant. I can help you find stylish clothes, recover your cart, track orders, or answer questions. What can I assist you with today?',
        isUser: false,
        timestamp: new Date(),
        date: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isExpanded, messages.length]);

  // Determine prompt based on input
  const getPrompt = (userInput: string): string => {
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

  // Handle sending message to OpenAI
  const handleSend = useCallback(
    async (userInput: string) => {
      if (!userInput.trim()) return;

      const userMessage: Message = {
        text: userInput,
        isUser: true,
        timestamp: new Date(),
        date: new Date(),
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
                { role: 'system', content: getPrompt(userInput) },
                ...conversationHistory,
                { role: 'user', content: userInput },
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
      } catch (error) {
        console.error('OpenAI API error:', error);
        setMessages((prev) => [
          ...prev,
          {
            text: 'Sorry, something went wrong.',
            isUser: false,
            timestamp: new Date(),
            date: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, products, isProductsLoading]
  );

  // Handle chat toggle
  const handleChatToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
    if (!isExpanded) {
      setShowPopup(false);
    }
  }, [isExpanded]);

  return {
    messages,
    input,
    isLoading,
    isExpanded,
    showPopup,
    products,
    isProductsLoading,
    handleChatToggle,
    handleSend,
    setInput,
    setIsExpanded,
    setShowPopup,
  };
}

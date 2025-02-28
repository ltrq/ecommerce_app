// app/utils/chatboxService.ts
import { useState, useEffect, useCallback } from 'react';
import { useProducts } from '../context/productContext';
import {
  LTRQ_AIBotProductRecommendationPrompt,
  LTRQ_AIBotCartRecoveryPrompt,
  LTRQ_AIBotSupportPrompt,
  LTRQ_AIBotLeadGenPrompt,
  LTRQ_AIBotOrderSupportPrompt,
} from './AIchatbot-prompts';

// Define product interface to match AIchatbot-prompts.ts (capitalized fields)
export interface Product {
  itemName: string;
  Price: number; // Capitalized to match AIchatbot-prompts.ts
  Color: string; // Capitalized
  ItemSize: string; // Capitalized
}

// Transform lowercase Product from ProductContext to capitalized Product
const transformToCapitalizedProduct = (product: any): Product => ({
  itemName: product.itemName,
  Price: product.price || 0,
  Color: product.color || 'N/A',
  ItemSize: product.itemSize || 'N/A',
});

// Transform array of lowercase Products to capitalized Products
const transformProducts = (products: any[]): Product[] =>
  products.map(transformToCapitalizedProduct);

// Message type with date
export interface Message {
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

// No need for validation since ProductContext provides trusted data
export function useChatboxService() {
  const { products, isLoading: productsLoading, error } = useProducts(); // Access products from ProductContext
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPopup, setShowPopup] = useState(true);

  // Determine prompt based on input, using transformed products
  const getPrompt = (userInput: string): string => {
    if (!userInput.trim())
      return LTRQ_AIBotProductRecommendationPrompt(
        transformProducts(products || [])
      );
    const lowerInput = userInput.toLowerCase();
    const words = lowerInput.split(/\s+/);

    if (productsLoading || !products || products.length === 0) {
      return LTRQ_AIBotProductRecommendationPrompt([]); // Fallback to empty products if loading or error
    }

    if (words.some((word) => orderKeywords.includes(word))) {
      return LTRQ_AIBotOrderSupportPrompt(
        transformProducts(products),
        userInput
      );
    } else if (words.some((word) => cartKeywords.includes(word))) {
      return LTRQ_AIBotCartRecoveryPrompt(
        transformProducts(products),
        userInput
      );
    } else if (words.some((word) => supportKeywords.includes(word))) {
      return LTRQ_AIBotSupportPrompt(transformProducts(products), userInput);
    } else if (words.some((word) => recommendationKeywords.includes(word))) {
      return LTRQ_AIBotProductRecommendationPrompt(
        transformProducts(products),
        userInput
      );
    } else if (words.some((word) => leadKeywords.includes(word))) {
      return LTRQ_AIBotLeadGenPrompt(transformProducts(products), userInput);
    }
    return LTRQ_AIBotProductRecommendationPrompt(
      transformProducts(products),
      userInput
    );
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
        if (productsLoading || !products || products.length === 0) {
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
    [messages, products, productsLoading]
  );

  // Handle chat toggle
  const handleChatToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
    if (!isExpanded) {
      setShowPopup(false);
    }
  }, [isExpanded]);

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
    // Reset pop-up visibility when chatbox is closed
    if (!isExpanded) {
      setShowPopup(true);
    }
  }, [isExpanded, messages.length]);

  return {
    messages,
    input,
    isLoading,
    isExpanded,
    showPopup,
    products: transformProducts(products || []), // Return transformed products
    isProductsLoading: productsLoading,
    handleChatToggle,
    handleSend,
    setInput,
    setIsExpanded,
    setShowPopup,
    setMessages, // Included in the return object
  };
}

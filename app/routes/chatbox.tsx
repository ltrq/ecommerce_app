// app/components/Chatbox.tsx
import { useState, useRef, useEffect } from 'react';
import { fetchAllProducts } from '../utils/baserow'; // Adjust the import path if needed
import {
  LTRQ_AIBotProductRecommendationPrompt,
  LTRQ_AIBotCartRecoveryPrompt,
  LTRQ_AIBotSupportPrompt,
  LTRQ_AIBotLeadGenPrompt,
  LTRQ_AIBotOrderSupportPrompt,
} from '../utils/AIchatbot-prompts'; // Adjust the import path if needed

export default function Chatbox() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPopup, setShowPopup] = useState(true); // State for pop-up visibility
  const [messages, setMessages] = useState<
    { text: string; isUser: boolean; timestamp: Date }[]
  >([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // State for Baserow products
  const [products, setProducts] = useState<any[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);

  // Fetch Baserow products
  useEffect(() => {
    console.log('Products fetching started');
    const loadProducts = async () => {
      setIsProductsLoading(true);
      try {
        const productData = await fetchAllProducts();
        console.log('Products fetched:', productData);
        setProducts(productData.results || []); // Ensure results is an array, default to empty if undefined
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([
          {
            itemName: 'Slim Fit Shirt',
            Price: 29.99,
            Color: 'Red',
            ItemSize: 'M',
          },
        ]); // Fallback mock data
      } finally {
        setIsProductsLoading(false);
        console.log('Products state:', products);
      }
    };
    loadProducts();
  }, []);

  // Show initial welcome message when chatbox is expanded
  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      const welcomeMessage = {
        text: 'Hello! I’m LTRQ AI, your personal shopping assistant. I can help you find stylish clothes, recover your cart, track orders, or answer questions. What can I assist you with today?',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
    // Reset pop-up visibility when chatbox is closed
    if (!isExpanded) {
      setShowPopup(true); // Show popup when chatbox is closed
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

  // Determine which prompt to use based on input
  const getPrompt = (userInput: string) => {
    if (!userInput.trim())
      return LTRQ_AIBotProductRecommendationPrompt(products);
    const lowerInput = userInput.toLowerCase();
    if (
      lowerInput.includes('order') ||
      lowerInput.includes('status') ||
      lowerInput.includes('track')
    ) {
      return LTRQ_AIBotOrderSupportPrompt(products, userInput);
    } else if (
      lowerInput.includes('cart') ||
      lowerInput.includes('abandon') ||
      lowerInput.includes('buy')
    ) {
      return LTRQ_AIBotCartRecoveryPrompt(products, userInput);
    } else if (
      lowerInput.includes('help') ||
      lowerInput.includes('support') ||
      lowerInput.includes('return')
    ) {
      return LTRQ_AIBotSupportPrompt(products, userInput);
    } else if (
      lowerInput.includes('recommend') ||
      lowerInput.includes('looking') ||
      lowerInput.includes('need')
    ) {
      return LTRQ_AIBotProductRecommendationPrompt(products, userInput);
    } else if (
      lowerInput.includes('name') ||
      lowerInput.includes('email') ||
      lowerInput.includes('lead')
    ) {
      return LTRQ_AIBotLeadGenPrompt(products, userInput);
    }
    return LTRQ_AIBotProductRecommendationPrompt(products, userInput); // Default to product recommendations
  };

  // Handle sending a message to OpenAI with full conversation history
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true, timestamp: new Date() };
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

      // Convert messages to OpenAI format, including full history
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
        },
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error('OpenAI API error:', error);
      setMessages((prev) => [
        ...prev,
        {
          text: 'Sorry, something went wrong.',
          isUser: false,
          timestamp: new Date(),
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

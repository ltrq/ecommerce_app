// app/components/Chatbox.tsx
import { useState, useRef, useEffect } from 'react';
import { useChatboxService } from '../utils/chatboxServices'; // New service import

export default function Chatbox() {
  const {
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
  } = useChatboxService();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Show initial welcome message when chatbox is expanded
  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      handleChatToggle(); // This might trigger a welcome message in the service
    }
    // Reset pop-up visibility when chatbox is closed
    if (!isExpanded) {
      setShowPopup(true);
    }
  }, [isExpanded, messages.length, handleChatToggle, setShowPopup]);

  // Handle form submission, passing the input value to handleSend
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSend(input); // Pass the input value as a string
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
                      {msg.date && ` | Date: ${msg.date.toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-2 border-t">
            <form onSubmit={onSubmit}>
              {' '}
              {/* Updated to use onSubmit function */}
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

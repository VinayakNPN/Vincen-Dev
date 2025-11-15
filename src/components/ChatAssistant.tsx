import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Sparkles, Mic, Volume2, MicOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ExtractedDocument, analyzeSpendingByCategory, findItemsByName, calculateAverageSpending } from "../utils/documentParser";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatAssistantProps {
  uploadedDocuments: ExtractedDocument[];
}

export function ChatAssistant({ uploadedDocuments }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your LUMEN AI assistant. I can analyze your uploaded receipts and invoices to help you understand your spending patterns, track specific purchases, and provide personalized financial guidance. Upload a document and ask me anything!",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const startVoiceInput = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Check if documents are uploaded
    if (uploadedDocuments.length === 0) {
      if (lowerMessage.includes("upload") || lowerMessage.includes("document") || lowerMessage.includes("receipt")) {
        return "You haven't uploaded any documents yet. Click the 'Upload Bills/Receipts' button to get started. Once you upload invoices or receipts, I'll be able to analyze your spending in detail!";
      }
    } else {
      // Analyze uploaded documents
      const categorySpending = analyzeSpendingByCategory(uploadedDocuments);
      const totalSpent = uploadedDocuments.reduce((sum, doc) => sum + doc.total, 0);
      const avgSpending = calculateAverageSpending(uploadedDocuments);

      // Product-specific queries
      if (lowerMessage.includes("how much") && (lowerMessage.includes("spent on") || lowerMessage.includes("spend on"))) {
        const searchTerms = ["chicken", "milk", "gas", "coffee", "book", "mouse", "cable", "detergent", "yogurt", "banana"];
        const foundTerm = searchTerms.find(term => lowerMessage.includes(term));
        
        if (foundTerm) {
          const items = findItemsByName(uploadedDocuments, foundTerm);
          if (items.length > 0) {
            const total = items.reduce((sum, item) => sum + item.price, 0);
            const itemsList = items.map(item => `${item.name} ($${item.price.toFixed(2)})`).join(", ");
            return `Based on your uploaded receipts, you spent $${total.toFixed(2)} on items matching "${foundTerm}". Here's what I found: ${itemsList}. ${items.length > 1 ? `That's an average of $${(total/items.length).toFixed(2)} per item.` : ""}`;
          } else {
            return `I couldn't find any purchases matching "${foundTerm}" in your uploaded documents. Try uploading more receipts or ask about other items!`;
          }
        }
      }

      // Category-specific spending
      if (lowerMessage.includes("category") || lowerMessage.includes("categories")) {
        const categories = Object.entries(categorySpending)
          .sort((a, b) => b[1] - a[1])
          .map(([cat, amount]) => `${cat}: $${amount.toFixed(2)}`)
          .join(", ");
        return `Here's your spending breakdown by category from your uploaded documents: ${categories}. Your highest spending category is ${Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0][0]}. Would you like suggestions on reducing spending in any area?`;
      }

      // Specific category queries
      const categories = Object.keys(categorySpending);
      const foundCategory = categories.find(cat => lowerMessage.includes(cat.toLowerCase()));
      if (foundCategory) {
        const amount = categorySpending[foundCategory];
        const percentage = (amount / totalSpent * 100).toFixed(1);
        return `You've spent $${amount.toFixed(2)} on ${foundCategory}, which is ${percentage}% of your total spending ($${totalSpent.toFixed(2)}). This category includes ${uploadedDocuments.flatMap(d => d.items.filter(i => i.category === foundCategory)).length} items.`;
      }

      // Average spending
      if (lowerMessage.includes("average")) {
        return `Your average spending per transaction is $${avgSpending.toFixed(2)}. You've uploaded ${uploadedDocuments.length} document${uploadedDocuments.length > 1 ? 's' : ''} totaling $${totalSpent.toFixed(2)}. ${avgSpending > 50 ? "Consider setting a spending limit per transaction to save more!" : "Great job keeping your transactions moderate!"}`;
      }

      // Reduce expenses / savings advice
      if (lowerMessage.includes("reduce") || lowerMessage.includes("save") || lowerMessage.includes("cut")) {
        const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
        return `Here are personalized tips to reduce expenses: 1) Your highest spending is in ${topCategory[0]} ($${topCategory[1].toFixed(2)}). Consider buying generic brands or shopping sales. 2) Track every receipt like you're doing now - awareness is the first step! 3) Set category budgets: aim to reduce your top category by 15-20%. 4) Use cashback apps for additional savings. Would you like specific tips for ${topCategory[0]}?`;
      }

      // Total spending query
      if (lowerMessage.includes("total") || lowerMessage.includes("how much did i spend")) {
        const merchantList = uploadedDocuments.map(d => `${d.merchant} ($${d.total.toFixed(2)})`).join(", ");
        return `Based on your ${uploadedDocuments.length} uploaded document${uploadedDocuments.length > 1 ? 's' : ''}, you've spent a total of $${totalSpent.toFixed(2)}. Breakdown by merchant: ${merchantList}. Your average purchase is $${avgSpending.toFixed(2)}.`;
      }

      // List all items
      if (lowerMessage.includes("show me") || lowerMessage.includes("list") || lowerMessage.includes("what did i buy")) {
        const recentDoc = uploadedDocuments[uploadedDocuments.length - 1];
        const itemsList = recentDoc.items.map(item => `${item.name} (${item.quantity}x $${item.price.toFixed(2)})`).join(", ");
        return `Your most recent receipt from ${recentDoc.merchant} shows: ${itemsList}. Total: $${recentDoc.total.toFixed(2)}. Want to see items from other receipts?`;
      }

      // Merchant-specific
      const merchants = uploadedDocuments.map(d => d.merchant.toLowerCase());
      const foundMerchant = uploadedDocuments.find(d => lowerMessage.includes(d.merchant.toLowerCase()));
      if (foundMerchant) {
        const itemsList = foundMerchant.items.map(item => `${item.name} ($${item.price.toFixed(2)})`).join(", ");
        return `At ${foundMerchant.merchant} on ${foundMerchant.date}, you purchased: ${itemsList}. Total: $${foundMerchant.total.toFixed(2)}.`;
      }
    }

    // General queries (when documents are uploaded)
    if (lowerMessage.includes("help") || lowerMessage.includes("what can you do")) {
      return uploadedDocuments.length > 0 
        ? "I can analyze your uploaded receipts to: 📊 Show spending by category, 🔍 Find specific product purchases, 💰 Calculate averages, 📈 Track merchant spending, 🎯 Provide savings tips, and 📱 Answer questions about your purchases. Just ask!"
        : "Upload your receipts and I can: 📊 Analyze spending patterns, 💰 Track specific products, 📈 Calculate category totals, 🎯 Provide personalized savings advice. Click 'Upload Bills/Receipts' to get started!";
    }

    if (lowerMessage.includes("hi") || lowerMessage.includes("hello") || lowerMessage.includes("hey")) {
      return uploadedDocuments.length > 0
        ? `Hello! I've analyzed ${uploadedDocuments.length} document${uploadedDocuments.length > 1 ? 's' : ''} for you. Ask me anything about your spending! 😊`
        : "Hello! Upload a receipt and I'll help you analyze your spending! 😊";
    }

    if (lowerMessage.includes("thank")) {
      return "You're welcome! Keep uploading receipts and I'll help you track every penny. Smart spending starts with awareness! 💪";
    }

    // Default response
    return uploadedDocuments.length > 0
      ? "I can help you analyze your uploaded receipts! Try asking: 'How much did I spend on groceries?' or 'Show me my spending by category' or 'What's my average spending?' or 'How can I reduce expenses?'"
      : "Upload a receipt or invoice first, then I can answer detailed questions about your spending, specific products, categories, and provide personalized financial advice!";
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking and responding
    setTimeout(() => {
      const responseText = getAIResponse(inputValue);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
      
      // Auto-speak AI response if user used voice input
      if (isListening) {
        speakText(responseText);
      }
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Notify user when new document is uploaded
  useEffect(() => {
    if (uploadedDocuments.length > 0 && isOpen) {
      const latestDoc = uploadedDocuments[uploadedDocuments.length - 1];
      const notificationMessage: Message = {
        id: `doc-${latestDoc.id}`,
        text: `🎉 I've analyzed your receipt from ${latestDoc.merchant}! You spent $${latestDoc.total.toFixed(2)} on ${latestDoc.items.length} items. Ask me anything about this purchase!`,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages((prev) => {
        // Avoid duplicate notifications
        if (prev.some(m => m.id === notificationMessage.id)) return prev;
        return [...prev, notificationMessage];
      });
    }
  }, [uploadedDocuments.length, isOpen]);

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center group"
        style={{ 
          background: isOpen ? "#666" : "var(--lumen-accent)",
          transform: isOpen ? "rotate(0deg)" : "rotate(0deg)"
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white transition-transform duration-300" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        )}
        
        {/* Pulse animation when closed */}
        {!isOpen && (
          <span 
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: "var(--lumen-accent)" }}
          />
        )}
        
        {/* Notification badge */}
        {!isOpen && uploadedDocuments.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            {uploadedDocuments.length}
          </span>
        )}
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div 
            className="p-4 border-b border-gray-200 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, var(--lumen-accent) 0%, #00B8E6 100%)" }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white">LUMEN AI</h3>
                <p className="text-xs text-white/80">
                  {uploadedDocuments.length > 0 
                    ? `Analyzing ${uploadedDocuments.length} document${uploadedDocuments.length > 1 ? 's' : ''}`
                    : "Your Financial Assistant"
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    message.sender === "user"
                      ? "text-white"
                      : "bg-white border border-gray-200 text-gray-900 shadow-sm"
                  }`}
                  style={message.sender === "user" ? { background: "var(--lumen-accent)" } : {}}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p
                      className={`text-xs ${
                        message.sender === "user" ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {message.sender === "ai" && (
                      <button
                        onClick={() => isSpeaking ? stopSpeaking() : speakText(message.text)}
                        className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                        title={isSpeaking ? "Stop speaking" : "Read aloud"}
                      >
                        <Volume2 className="w-3 h-3 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex space-x-1.5">
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ 
                        background: "var(--lumen-accent)",
                        animationDelay: "0ms"
                      }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ 
                        background: "var(--lumen-accent)",
                        animationDelay: "150ms"
                      }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ 
                        background: "var(--lumen-accent)",
                        animationDelay: "300ms"
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <button
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                className={`h-11 w-11 p-0 rounded-lg transition-all ${
                  isListening 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Ask about your spending..."}
                className="flex-1 h-11 bg-gray-50 border-gray-200 focus:border-[var(--lumen-accent)]"
                disabled={isListening}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isListening}
                className="h-11 w-11 p-0 text-white hover:opacity-90 transition-opacity disabled:opacity-30"
                style={{ background: "var(--lumen-accent)" }}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {isListening ? "🎤 Listening to your voice..." : "AI-powered insights • Voice & Text support"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

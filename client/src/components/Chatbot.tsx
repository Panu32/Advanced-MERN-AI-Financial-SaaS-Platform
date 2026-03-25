import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

export const Chatbot = () => {
  const accessToken = useSelector((state: RootState) => state.auth?.accessToken);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'bot',
    content: "Hi! I'm your Finora AI Financial Advisor. Ask me anything about your transactions, spending habits, or financial advice!"
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error from backend');
      }

      const botReply = data?.data?.reply || data?.message || "I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'bot', content: botReply }]);
    } catch (error: any) {
      console.error('Error fetching chat response:', error);
      setMessages(prev => [...prev, { role: 'bot', content: `Sorry, an error occurred: ${error.message || "I'm having trouble connecting right now."}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-semibold text-lg">Finora AI Advisor</h3>
            </div>
            <button 
              onClick={toggleChat}
              className="hover:bg-primary/80 p-1 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex items-start gap-2 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "p-2 rounded-full flex-shrink-0 mt-1",
                  msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border"
                )}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                    : "bg-background border text-foreground rounded-tl-sm"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 max-w-[85%] mr-auto">
                <div className="p-2 rounded-full flex-shrink-0 bg-muted border">
                  <Bot size={16} />
                </div>
                <div className="p-3 bg-background border rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-background border-t">
            <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your finances..."
                className="flex-1 resize-none rounded-2xl border bg-muted/50 px-4 py-3 min-h-[44px] max-h-32 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={toggleChat}
        className={cn(
          "flex items-center justify-center w-14 h-14 rounded-full shadow-lg text-primary-foreground transition-all duration-300 hover:scale-105",
          isOpen ? "bg-muted-foreground scale-90" : "bg-primary"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};

export default Chatbot;

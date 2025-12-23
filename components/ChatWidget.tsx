import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { ChatMessage, Property } from '../types';
import { chatWithGemini } from '../services/geminiService';
import { INITIAL_MESSAGE } from '../constants';

interface ChatWidgetProps {
  properties: Property[];
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ properties }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: INITIAL_MESSAGE,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Prepare history for API
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      const responseText = await chatWithGemini(userMsg.text, properties, history);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[350px] sm:w-[380px] h-[500px] flex flex-col border border-gray-200 mb-4 animate-fade-in-up overflow-hidden">
          {/* Header */}
          <div className="bg-red-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Asistente SC</h3>
                <p className="text-xs text-red-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full block animate-pulse"></span>
                  En línea con Gemini
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded transition">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 scrollbar-hide">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user'
                    ? 'bg-red-600 text-white rounded-br-none'
                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-red-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-100 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Pregunta sobre casas..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`p-2 rounded-full transition-colors ${input.trim() && !isTyping
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center ${isOpen ? 'rotate-90 scale-0 opacity-0 hidden' : 'rotate-0 scale-100 opacity-100'}`}
      >
        <MessageCircle size={28} />
      </button>
    </div>
  );
};
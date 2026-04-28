import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import './AIChat.css';

const initialMessages = [
  { id: 1, sender: 'ai', text: 'Hello! I am AgriBot Assistant. How can I help you with your field today?' },
];

export default function AIChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMsg = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    // Mock AI response delay
    setTimeout(() => {
      const aiResponse = getMockResponse(newUserMsg.text);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const getMockResponse = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('moisture') || lowerText.includes('water')) {
      return "Current soil moisture is 42%. It's slightly below optimal for this time of day. I recommend scheduling a 15-minute irrigation cycle for Zone A.";
    }
    if (lowerText.includes('disease') || lowerText.includes('blight')) {
      return "I see you checked for Leaf Blight recently. Applying copper-based fungicide in the early morning is recommended. Make sure wind speed is below 10 km/h.";
    }
    return "I've noted that down. Monitoring all sensors. Let me know if you need specific readings or recommendations.";
  };

  return (
    <div className="chat-page">
      <div className="page-header">
        <h1 className="page-title">AI Assistant</h1>
        <p className="page-subtitle">Ask questions about field data, predictions, and bot status</p>
      </div>

      <div className="chat-container card">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message-row ${msg.sender === 'user' ? 'user' : 'ai'}`}>
              {msg.sender === 'ai' && (
                <div className="avatar ai-avatar">
                  <Bot size={18} />
                </div>
              )}
              <div className={`chat-bubble ${msg.sender}`}>
                {msg.text}
              </div>
              {msg.sender === 'user' && (
                <div className="avatar user-avatar">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="chat-message-row ai">
              <div className="avatar ai-avatar">
                <Bot size={18} />
              </div>
              <div className="chat-bubble ai typing">
                <div className="dot-flashing"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Type your question here..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="chat-send-btn" disabled={!inputValue.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
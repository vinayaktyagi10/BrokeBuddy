import React, { useState } from 'react';
import axios from 'axios';
import '../styles/retro.css'; // Optional: add styles here

export default function ChatWindow({ onClose, chatHistory = [], setChatHistory }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...chatHistory, { role: 'user', content: input }];
    setChatHistory(newMessages);
    setInput('');
    setLoading(true);

    try {
	const res = await axios.post('http://localhost:8000/advice', { messages: updatedMessages }, 
	{
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const reply =
        res.data.message || res.data.response || '💸 No advice returned.';

      setChatHistory([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      setChatHistory([
        ...newMessages,
        { role: 'assistant', content: '⚠️ Something went wrong.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-overlay">
      <div className="chat-box">
        <div className="chat-header">
          BrokeBuddy 💸
          <button onClick={onClose} className="close-btn">✖</button>
        </div>

        <div className="chat-messages">
          {chatHistory.map((msg, i) => (
            <div key={i} className={`msg ${msg.role}`}>
              <span>{msg.content}</span>
            </div>
          ))}
          {loading && <div className="msg assistant">Typing...</div>}
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything money-related..."
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

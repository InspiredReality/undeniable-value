import React, { useRef, useEffect, useState } from 'react';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import HistoryPanel from '../components/HistoryPanel';
import { useChat } from '../hooks/useChat';
import { useChatContext, PAGE_INITIAL } from '../context/ChatContext';
import './Page.css';
import './Win.css';

const FALLBACKS = [
  "Let's break that down. What does success actually look like in concrete terms?",
  "Good start. Now — what's the one thing you can do in the next 24 hours to move this forward?",
  "That's a direction, not a goal yet. What would you measure to know you've won?",
  "Solid. What's the biggest obstacle between you and this, and how do you plan to handle it?",
  "Got it. Give me a deadline and I'll help you make it real."
];

export default function Win() {
  const { messages, typing, sendMessage } = useChat('win', FALLBACKS);
  const { updateSession } = useChatContext();
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch('/memory/win.md').then(r => r.text()).then(setSystemPrompt);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSelectConversation = async (id) => {
    const res = await fetch(`/api/conversation?id=${id}`);
    const msgs = await res.json();
    updateSession('win', { messages: msgs, conversationId: id });
    setShowHistory(false);
  };

  const handleNewConversation = () => {
    updateSession('win', { messages: PAGE_INITIAL.win, conversationId: null });
    setShowHistory(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Win</h1>
          <p className="page-subtitle">Turn ideas into goals. Goals into action.</p>
        </div>
        <button
          className={`history-toggle${showHistory ? ' active' : ''}`}
          onClick={() => setShowHistory(h => !h)}
        >
          History
        </button>
      </div>

      <div className="page-body">
        {showHistory && (
          <HistoryPanel
            page="win"
            onSelect={handleSelectConversation}
            onNew={handleNewConversation}
          />
        )}
        <div className="chat-area">
          <div className="chat-scroll">
            {messages.map((m, i) => (
              <ChatBubble key={i} role={m.role} text={m.text} />
            ))}
            {typing && <ChatBubble role="assistant" typing />}
            <div ref={bottomRef} />
          </div>
          <ChatInput onSend={text => sendMessage(text, systemPrompt)} disabled={typing} />
        </div>
      </div>
    </div>
  );
}

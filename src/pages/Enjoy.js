import React, { useRef, useEffect, useState } from 'react';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import HistoryPanel from '../components/HistoryPanel';
import { useChat } from '../hooks/useChat';
import { useChatContext, PAGE_INITIAL } from '../context/ChatContext';
import './Page.css';

const FALLBACKS = [
  "That's worth savoring. Take a moment with it.",
  "Beautiful. Enjoyment is fuel — don't skip it.",
  "Yes. This is the part people forget to do. Well done.",
  "Love that. What made it feel good?",
  "Exactly right. More of this, please."
];

export default function Enjoy() {
  const { messages, typing, sendMessage } = useChat('enjoy', FALLBACKS);
  const { updateSession } = useChatContext();
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch('/memory/enjoy.md').then(r => r.text()).then(setSystemPrompt);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSelectConversation = async (id) => {
    const res = await fetch(`/api/conversation?id=${id}`);
    const msgs = await res.json();
    updateSession('enjoy', { messages: msgs, conversationId: null });
    setShowHistory(false);
  };

  const handleNewConversation = () => {
    updateSession('enjoy', { messages: PAGE_INITIAL.enjoy, conversationId: null });
    setShowHistory(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Enjoy</h1>
          <p className="page-subtitle">Slow down. Take it in.</p>
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
            page="enjoy"
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

import React, { useRef, useEffect, useState } from 'react';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import HistoryPanel from '../components/HistoryPanel';
import { useChat } from '../hooks/useChat';
import { useChatContext, PAGE_INITIAL } from '../context/ChatContext';
import './Page.css';

const FALLBACKS = [
  "That sounds fun! Let's explore that idea together.",
  "Interesting choice. Play is all about curiosity — where do you want to take this?",
  "Love it. Experimentation is how the best things get built.",
  "Nice. No rules here — just ideas and momentum.",
  "Let's go! What's the first move?"
];

export default function Play() {
  const { messages, typing, sendMessage } = useChat('play', FALLBACKS);
  const { updateSession } = useChatContext();
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch('/memory/play.md').then(r => r.text()).then(setSystemPrompt);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSelectConversation = async (id) => {
    const res = await fetch(`/api/conversation?id=${id}`);
    const msgs = await res.json();
    updateSession('play', { messages: msgs, conversationId: null });
    setShowHistory(false);
  };

  const handleNewConversation = () => {
    updateSession('play', { messages: PAGE_INITIAL.play, conversationId: null });
    setShowHistory(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Play</h1>
          <p className="page-subtitle">Explore freely. No wrong answers.</p>
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
            page="play"
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

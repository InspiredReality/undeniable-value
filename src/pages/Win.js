import React, { useRef, useEffect, useState } from 'react';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import { useChat } from '../hooks/useChat';
import './Page.css';
import './Win.css';

const INITIAL = [
  { role: 'assistant', text: "Welcome to Win. Type a goal — rough, vague, or half-formed — and I'll help you sharpen it into something actionable." }
];

const FALLBACKS = [
  "Let's break that down. What does success actually look like in concrete terms?",
  "Good start. Now — what's the one thing you can do in the next 24 hours to move this forward?",
  "That's a direction, not a goal yet. What would you measure to know you've won?",
  "Solid. What's the biggest obstacle between you and this, and how do you plan to handle it?",
  "Got it. Give me a deadline and I'll help you make it real."
];

export default function Win() {
  const { messages, typing, sendMessage } = useChat(INITIAL, FALLBACKS);
  const [systemPrompt, setSystemPrompt] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch('/memory/win.md').then(r => r.text()).then(setSystemPrompt);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Win</h1>
        <p className="page-subtitle">Turn ideas into goals. Goals into action.</p>
      </div>

      <div className="chat-scroll">
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} text={m.text} />
        ))}
        {typing && <ChatBubble role="assistant" typing />}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={text => sendMessage(text, systemPrompt)} disabled={typing} />
    </div>
  );
}

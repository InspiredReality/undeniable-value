import React, { useRef, useEffect, useState } from 'react';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import { useChat } from '../hooks/useChat';
import './Page.css';

const INITIAL = [
  { role: 'assistant', text: "Welcome to Enjoy. You've earned this. What would you like to savor or celebrate today?" }
];

export default function Enjoy() {
  const { messages, typing, sendMessage } = useChat(INITIAL);
  const [systemPrompt, setSystemPrompt] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch('/memory/enjoy.md').then(r => r.text()).then(setSystemPrompt);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Enjoy</h1>
        <p className="page-subtitle">Slow down. Take it in.</p>
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

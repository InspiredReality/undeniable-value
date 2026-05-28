import React, { useRef, useEffect } from 'react';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import { useChat } from '../hooks/useChat';
import './Page.css';

const INITIAL = [
  {
    role: 'assistant',
    text: "Welcome to Play! This is your space to experiment, explore ideas, and have fun. What would you like to create or try today?"
  }
];

const REPLIES = [
  "That sounds fun! Let's explore that idea together.",
  "Interesting choice. Play is all about curiosity — where do you want to take this?",
  "Love it. Experimentation is how the best things get built.",
  "Nice. No rules here — just ideas and momentum.",
  "Let's go! What's the first move?"
];

function getReply(text) {
  return REPLIES[Math.floor(Math.random() * REPLIES.length)];
}

export default function Play() {
  const { messages, typing, sendMessage } = useChat(INITIAL);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Play</h1>
        <p className="page-subtitle">Explore freely. No wrong answers.</p>
      </div>

      <div className="chat-scroll">
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} text={m.text} />
        ))}
        {typing && <ChatBubble role="assistant" typing />}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={text => sendMessage(text, getReply)} disabled={typing} />
    </div>
  );
}

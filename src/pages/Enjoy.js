import React, { useRef, useEffect } from 'react';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import { useChat } from '../hooks/useChat';
import './Page.css';

const INITIAL = [
  {
    role: 'assistant',
    text: "Welcome to Enjoy. You've earned this. What's on your mind — or what would you like to celebrate today?"
  }
];

const REPLIES = [
  "That's worth savoring. Take a moment with it.",
  "Beautiful. Enjoyment is fuel — don't skip it.",
  "Yes. This is the part people forget to do. Well done.",
  "Love that. What made it feel good?",
  "Exactly right. More of this, please."
];

function getReply(text) {
  return REPLIES[Math.floor(Math.random() * REPLIES.length)];
}

export default function Enjoy() {
  const { messages, typing, sendMessage } = useChat(INITIAL);
  const bottomRef = useRef(null);

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

      <ChatInput onSend={text => sendMessage(text, getReply)} disabled={typing} />
    </div>
  );
}

import { useState, useCallback } from 'react';

export function useChat(initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages);
  const [typing, setTyping] = useState(false);

  const sendMessage = useCallback((userText, getReply) => {
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setTyping(true);

    setTimeout(() => {
      const reply = getReply(userText);
      setTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    }, 800 + Math.random() * 600);
  }, []);

  return { messages, typing, sendMessage };
}

import { useState, useCallback, useRef } from 'react';

export function useChat(initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages);
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef(initialMessages);

  const sendMessage = useCallback(async (userText, systemPrompt) => {
    const userMessage = { role: 'user', text: userText };
    const next = [...messagesRef.current, userMessage];
    messagesRef.current = next;
    setMessages(next);
    setTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          messages: next.map(m => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await res.json();
      const reply = { role: 'assistant', text: data.text };
      messagesRef.current = [...messagesRef.current, reply];
      setMessages(messagesRef.current);
    } catch {
      const reply = { role: 'assistant', text: 'Something went wrong. Please try again.' };
      messagesRef.current = [...messagesRef.current, reply];
      setMessages(messagesRef.current);
    } finally {
      setTyping(false);
    }
  }, []);

  return { messages, typing, sendMessage };
}

import { useState, useCallback, useRef } from 'react';

export function useChat(initialMessages = [], fallbackReplies = []) {
  const [messages, setMessages] = useState(initialMessages);
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef(initialMessages);

  const addMessages = (msgs) => {
    messagesRef.current = [...messagesRef.current, ...msgs];
    setMessages(messagesRef.current);
  };

  const sendMessage = useCallback(async (userText, systemPrompt) => {
    const next = [...messagesRef.current, { role: 'user', text: userText }];
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

      if (!res.ok) throw new Error(res.status);

      const data = await res.json();
      addMessages([{ role: 'assistant', text: data.text }]);
    } catch {
      const fallback = fallbackReplies.length
        ? fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)]
        : 'Sorry, I could not process that.';

      addMessages([
        { role: 'assistant', text: '⚠️ AI is unavailable right now — showing a backup response.' },
        { role: 'assistant', text: fallback },
      ]);
    } finally {
      setTyping(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { messages, typing, sendMessage };
}

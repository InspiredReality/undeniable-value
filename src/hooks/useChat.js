import { useState, useCallback, useRef } from 'react';
import { useChatContext } from '../context/ChatContext';

export function useChat(page, fallbackReplies = []) {
  const { sessions, updateSession } = useChatContext();
  const [typing, setTyping] = useState(false);

  // Refs avoid stale closures inside sendMessage
  const messagesRef = useRef(sessions[page].messages);
  const conversationIdRef = useRef(sessions[page].conversationId);
  messagesRef.current = sessions[page].messages;
  conversationIdRef.current = sessions[page].conversationId;

  const sendMessage = useCallback(async (userText, systemPrompt) => {
    const userMsg = { role: 'user', text: userText };
    const next = [...messagesRef.current, userMsg];
    messagesRef.current = next;
    updateSession(page, { messages: next });
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
      const assistantMsg = { role: 'assistant', text: data.text };
      const withReply = [...messagesRef.current, assistantMsg];
      messagesRef.current = withReply;
      updateSession(page, { messages: withReply });

      // Best-effort DB persistence — don't await so it doesn't block the UI
      persistMessages(page, userMsg, assistantMsg, conversationIdRef, updateSession);
    } catch {
      const fallback = fallbackReplies.length
        ? fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)]
        : 'Sorry, I could not process that.';

      const fallbackMsgs = [
        { role: 'assistant', text: '⚠️ AI is unavailable right now — showing a backup response.' },
        { role: 'assistant', text: fallback },
      ];
      const withFallback = [...messagesRef.current, ...fallbackMsgs];
      messagesRef.current = withFallback;
      updateSession(page, { messages: withFallback });
    } finally {
      setTyping(false);
    }
  }, [page, fallbackReplies, updateSession]); // eslint-disable-line react-hooks/exhaustive-deps

  return { messages: sessions[page].messages, typing, sendMessage };
}

async function persistMessages(page, userMsg, assistantMsg, conversationIdRef, updateSession) {
  try {
    let convId = conversationIdRef.current;

    if (!convId) {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, title: userMsg.text.slice(0, 100) }),
      });
      if (!res.ok) return;
      const data = await res.json();
      convId = data.id;
      conversationIdRef.current = convId;
      updateSession(page, { conversationId: convId });
    }

    await fetch('/api/conversation-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: convId,
        messages: [userMsg, assistantMsg],
      }),
    });
  } catch {
    // silently skip — DB is optional
  }
}

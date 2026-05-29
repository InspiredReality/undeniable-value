import React, { createContext, useContext, useState, useCallback } from 'react';

export const PAGE_INITIAL = {
  play: [{ role: 'assistant', text: "Welcome to Play! Explore freely — what's on your mind?" }],
  win: [{ role: 'assistant', text: "Welcome to Win. Type a goal — rough, vague, or half-formed — and I'll help you sharpen it into something actionable." }],
  enjoy: [{ role: 'assistant', text: "Welcome to Enjoy. You've earned this. What would you like to savor or celebrate today?" }],
};

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [sessions, setSessions] = useState({
    play:  { messages: PAGE_INITIAL.play,  conversationId: null },
    win:   { messages: PAGE_INITIAL.win,   conversationId: null },
    enjoy: { messages: PAGE_INITIAL.enjoy, conversationId: null },
  });

  const updateSession = useCallback((page, updates) =>
    setSessions(prev => ({ ...prev, [page]: { ...prev[page], ...updates } })),
  []);

  return (
    <ChatContext.Provider value={{ sessions, updateSession }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChatContext = () => useContext(ChatContext);

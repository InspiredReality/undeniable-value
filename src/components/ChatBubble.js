import React from 'react';
import './ChatBubble.css';

export default function ChatBubble({ role, text, typing }) {
  return (
    <div className={`bubble-wrap ${role}`}>
      <div className="bubble">
        {typing ? (
          <span className="typing-dots">
            <span /><span /><span />
          </span>
        ) : (
          text
        )}
      </div>
    </div>
  );
}

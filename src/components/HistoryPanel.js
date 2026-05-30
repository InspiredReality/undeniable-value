import React, { useEffect, useState } from 'react';
import './HistoryPanel.css';

export default function HistoryPanel({ page, onSelect, onNew }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/conversations?page=${page}`)
      .then(r => r.json())
      .then(data => {
        setConversations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page]);

  return (
    <div className="history-panel">
      <div className="history-panel-header">
        <span>History</span>
        <button className="history-new-btn" onClick={onNew}>+ New</button>
      </div>
      {loading ? (
        <p className="history-status">Loading…</p>
      ) : conversations.length === 0 ? (
        <p className="history-status">No past conversations yet.</p>
      ) : (
        <ul className="history-list">
          {conversations.map(c => (
            <li key={c.id} className="history-item" onClick={() => onSelect(c.id)}>
              <span className="history-item-title">{c.title || 'Untitled'}</span>
              <span className="history-item-date">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

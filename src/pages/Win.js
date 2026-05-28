import React, { useRef, useEffect, useState } from 'react';
import ChatBubble from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import './Page.css';
import './Win.css';

const CHAIN = [
  {
    label: 'Clarity',
    apply(text) {
      let t = text.trim();
      t = t.charAt(0).toUpperCase() + t.slice(1);
      if (!/[.!?]$/.test(t)) t += '.';
      t = t
        .replace(/\bwanna\b/gi, 'want to')
        .replace(/\bgonna\b/gi, 'going to')
        .replace(/\bgotta\b/gi, 'need to')
        .replace(/\bkinda\b/gi, 'kind of')
        .replace(/\bsorta\b/gi, 'sort of');
      return t;
    },
    message(improved) {
      return `Pass 1 — Clarity\n\nCleaned up and clarified:\n\n"${improved}"\n\nNext I'll make it specific and measurable. Reply to continue.`;
    }
  },
  {
    label: 'SMART goal',
    apply(text) {
      const core = text.replace(/\.$/, '');
      return `${core} — measured by a concrete, observable outcome with a defined deadline.`;
    },
    message(improved) {
      return `Pass 2 — Specificity\n\nFramed as a SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound):\n\n"${improved}"\n\nReady to add the first action step. Reply to continue.`;
    }
  },
  {
    label: 'First action step',
    apply(text) {
      return `${text}\n\nFirst step: Identify the single most important thing to do in the next 24 hours and do only that.`;
    },
    message(improved) {
      return `Pass 3 — Action\n\nAdded a concrete first move:\n\n"${improved}"\n\nNext I'll add obstacle mitigation so nothing stops you. Reply to continue.`;
    }
  },
  {
    label: 'Obstacle mitigation',
    apply(text) {
      return `${text}\n\nIf blocked: cut the first step in half and start there. Progress beats perfection.`;
    },
    message(improved) {
      return `Pass 4 — Resilience\n\nBuilt in a fallback plan:\n\n"${improved}"\n\nOne final pass — I'll anchor the motivation. Reply to continue.`;
    }
  },
  {
    label: 'Motivation anchor',
    apply(text) {
      return `${text}\n\nWhy it matters: achieving this moves me measurably closer to who I am becoming.`;
    },
    message(improved) {
      return `Pass 5 — Motivation\n\nFully refined goal:\n\n"${improved}"\n\nAll five passes complete. Copy it above and commit to it — or type a new goal to start fresh.`;
    }
  }
];

const INITIAL_MESSAGE = {
  role: 'assistant',
  text: 'Welcome to Win.\n\nType anything — a goal, a rough idea, even a fragment — and I\'ll progressively refine it into a clear, actionable goal statement across five improvement passes.'
};

export default function Win() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [typing, setTyping] = useState(false);
  const [currentDraft, setCurrentDraft] = useState('');
  const [passIndex, setPassIndex] = useState(-1);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  function handleSend(userText) {
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setTyping(true);

    const nextPass = passIndex + 1;

    if (nextPass >= CHAIN.length) {
      // All passes done — reset for a new goal
      setTimeout(() => {
        setTyping(false);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: 'All passes are complete for your current goal. Type a new goal to start the improvement cycle again.'
          }
        ]);
        setCurrentDraft('');
        setPassIndex(-1);
      }, 700);
      return;
    }

    const step = CHAIN[nextPass];
    const base = nextPass === 0 ? userText : currentDraft;
    const improved = step.apply(base);

    setTimeout(() => {
      setTyping(false);
      setCurrentDraft(improved);
      setPassIndex(nextPass);
      setMessages(prev => [...prev, { role: 'assistant', text: step.message(improved) }]);
    }, 900 + Math.random() * 600);
  }

  function handleCopy() {
    navigator.clipboard?.writeText(currentDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleReset() {
    setMessages([INITIAL_MESSAGE]);
    setCurrentDraft('');
    setPassIndex(-1);
    setTyping(false);
  }

  const progress = passIndex >= 0
    ? Math.round(((passIndex + 1) / CHAIN.length) * 100)
    : 0;

  const isDone = passIndex === CHAIN.length - 1;

  return (
    <div className="page">
      <div className="page-header win-header">
        <div>
          <h1 className="page-title">Win</h1>
          <p className="page-subtitle">Type anything. Each reply refines it further.</p>
        </div>
        {passIndex >= 0 && (
          <button className="reset-btn" onClick={handleReset}>New goal</button>
        )}
      </div>

      {currentDraft && (
        <div className={`draft-panel ${isDone ? 'done' : ''}`}>
          <div className="draft-header">
            <span className="draft-label">Current best</span>
            <span className="draft-pass">Pass {passIndex + 1} of {CHAIN.length} &mdash; {CHAIN[passIndex].label}</span>
            <button className="copy-btn" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="draft-text">{currentDraft}</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-steps">
            {CHAIN.map((step, i) => (
              <span
                key={step.label}
                className={`step-dot ${i < passIndex ? 'done' : ''} ${i === passIndex ? 'active' : ''}`}
                title={step.label}
              />
            ))}
          </div>
        </div>
      )}

      <div className="chat-scroll">
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} text={m.text} />
        ))}
        {typing && <ChatBubble role="assistant" typing />}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={typing} />
    </div>
  );
}

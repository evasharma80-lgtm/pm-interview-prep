'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('');
  const [thread, setThread] = useState([]); // [{ question, answer, sources }]
  const [topics, setTopics] = useState([]); // [{ category, count }]
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch('/api/documents')
      .then((r) => r.json())
      .then((json) => {
        const docs = json.documents || [];
        const counts = {};
        docs.forEach((d) => {
          const cat = d.category || 'General';
          counts[cat] = (counts[cat] || 0) + 1;
        });
        setTopics(Object.entries(counts).map(([category, count]) => ({ category, count })));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread, status]);

  async function ask(q) {
    if (!q.trim()) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const json = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(json.error || `Request failed (status ${res.status})`);
        return;
      }

      setThread((t) => [...t, { question: q, answer: json.answer, sources: json.sources || [] }]);
      setQuestion('');
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Network error — could not reach the server.');
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    ask(question);
  }

  return (
    <div>
      <h1>PM interview prep</h1>
      <p className="intro">Ask a question — answers are grounded in your indexed prep material where relevant, with sources cited.</p>

      <div className="app-layout">
        <div>
          {thread.length === 0 && status !== 'loading' && (
            <div className="empty-state">
              <strong>No questions yet</strong>
              Ask something below, or click a topic on the right to get started.
            </div>
          )}

          {thread.length > 0 && (
            <div className="thread">
              {thread.map((turn, i) => (
                <div key={i} className="turn">
                  <div className="msg-row from-user">
                    <div className="bubble bubble-question">{turn.question}</div>
                    <div className="avatar avatar-user">You</div>
                  </div>
                  <div className="msg-row">
                    <div className="avatar avatar-ai">AI</div>
                    <div className="bubble bubble-answer">{turn.answer}</div>
                  </div>
                  {turn.sources.length > 0 && (
                    <div className="source-chips">
                      {turn.sources.map((s, j) => (
                        <span key={j} className="source-chip">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {status === 'loading' && (
                <div className="msg-row">
                  <div className="avatar avatar-ai">AI</div>
                  <div className="bubble bubble-answer">
                    <span className="thinking-dots"><span></span><span></span><span></span></span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="ask-form">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How do I structure a RICE prioritization answer?"
            />
            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? (
                <span className="thinking-dots"><span></span><span></span><span></span></span>
              ) : (
                'Ask'
              )}
            </button>
          </form>
          {status === 'error' && <p className="error-text">Error: {errorMsg}</p>}
        </div>

        <div>
          <p className="sidebar-title">Topics</p>
          {topics.length === 0 && <p style={{ fontSize: 13, color: '#9A9D9F' }}>No material added yet.</p>}
          {topics.map((t) => (
            <button
              key={t.category}
              className="topic-chip"
              onClick={() => ask(`Tell me about ${t.category}`)}
            >
              {t.category} <span className="topic-count">{t.count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

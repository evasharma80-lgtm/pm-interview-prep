'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';

export default function Documents() {
  const [status, setStatus] = useState('idle'); // idle | saving | error | saved
  const [errorMsg, setErrorMsg] = useState('');
  const [documents, setDocuments] = useState([]);

  function loadDocuments() {
    fetch('/api/documents')
      .then((r) => r.json())
      .then((json) => setDocuments(json.documents || []))
      .catch(() => {});
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('saving');
    setErrorMsg('');

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(json.error || `Request failed (status ${res.status})`);
        return;
      }

      setStatus('saved');
      form.reset();
      loadDocuments();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Network error — could not reach the server.');
    }
  }

  return (
    <div>
      <h1>Add prep material</h1>
      <form onSubmit={handleSubmit} className="card">
        <label>Title</label>
        <input name="title" required placeholder="e.g. Trade-off frameworks" />
        <label>Category</label>
        <input name="category" placeholder="e.g. Frameworks, Product Sense, Metrics, Behavioral" />
        <label>Content</label>
        <textarea name="content" required rows={8} placeholder="Paste the actual prep material here…"></textarea>
        <label>Tags (comma-separated)</label>
        <input name="tags" placeholder="e.g. prioritization, frameworks" />

        {status === 'error' && <p className="error-text">Error: {errorMsg}</p>}
        {status === 'saved' && <p style={{ color: '#1E5C56', fontWeight: 600, fontSize: 13 }}>Saved.</p>}

        <button type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Add material'}
        </button>
      </form>

      <h2 style={{ fontFamily: 'Newsreader, serif', fontWeight: 500, fontSize: 18, color: '#1F3864' }}>
        Existing material
      </h2>
      <div className="card">
        {documents.length === 0 && <p style={{ fontSize: 13, color: '#9A9D9F' }}>Nothing added yet.</p>}
        {documents.map((d) => (
          <div key={d.id} className="doc-row">
            <span className="doc-title">{d.title}</span>
            {d.category && <span className="doc-badge">{d.category}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

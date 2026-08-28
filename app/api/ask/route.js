import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase';

export async function POST(req) {
  try {
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const supabase = supabaseServer();

    const { data: docs, error: searchError } = await supabase
      .from('prep_documents')
      .select('*')
      .or(`title.ilike.%${question}%,content.ilike.%${question}%,category.ilike.%${question}%`)
      .limit(5);

    if (searchError) {
      return NextResponse.json({ error: searchError.message }, { status: 500 });
    }

    let contextDocs = docs;
    if (!contextDocs || contextDocs.length === 0) {
      const { data: fallback } = await supabase.from('prep_documents').select('*').limit(5);
      contextDocs = fallback || [];
    }

    const contextText = contextDocs
      .map((d) => `[${d.title}] (${d.category})\n${d.content}`)
      .join('\n\n---\n\n');

    const system = `You are a PM interview prep assistant. You have two sources to draw on: (1) the reference material below, which is the user's own indexed prep notes, and (2) your own general PM knowledge. Use both: ground your answer in the reference material where it's relevant, and cite which document(s) you drew from — but also fill in with your own knowledge where the reference material is thin, silent, or missing entirely. Be clear about which parts came from the reference material versus your own general knowledge (e.g. "Your notes on X say... / More generally, ..."). Keep answers concise and practical.

Reference material (may be partial or empty — supplement with your own knowledge as needed):
${contextText}`;

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: question }] }],
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json({ error: 'LLM call failed: ' + errText }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '(no response)';

    return NextResponse.json({
      answer,
      sources: contextDocs.map((d) => d.title),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

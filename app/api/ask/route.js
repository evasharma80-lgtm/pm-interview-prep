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

    const system = `You are a PM interview prep
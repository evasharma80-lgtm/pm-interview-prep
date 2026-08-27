import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase';

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('prep_documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ documents: data });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from('prep_documents')
      .insert({
        title: body.title,
        category: body.category,
        content: body.content,
        tags: body.tags ? body.tags.split(',').map((t) => t.trim()) : [],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ document: data });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

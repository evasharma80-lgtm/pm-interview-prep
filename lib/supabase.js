import { createClient } from '@supabase/supabase-js';

// Server-side client using the service role key. Only import this in
// server components or API routes — never expose it to the browser.
export function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

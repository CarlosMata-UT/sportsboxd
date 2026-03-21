import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Guard: createClient throws if URL/key are empty strings (e.g. during CI builds
// before env vars are configured). We return a no-op client shell so the app
// compiles, but any real DB call will fail loudly at runtime — which is the right
// behaviour when the env vars are genuinely missing.
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-project-url' || supabaseAnonKey === 'your-anon-key') {
    console.error('Missing or invalid Supabase environment variables. Please check your .env.local file.')
    // Fallback to empty strings to avoid crash, but calls will fail
    return createBrowserClient('', '')
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}

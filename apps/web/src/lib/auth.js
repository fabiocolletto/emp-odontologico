import { supabase } from './supabaseClient.js'

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data?.user || null
}

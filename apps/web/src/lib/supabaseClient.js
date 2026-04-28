import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const readAppEnv = () => {
  const localEnv = globalThis?.__APP_ENV__
  if (localEnv?.SUPABASE_URL && localEnv?.SUPABASE_ANON) return localEnv

  const parentEnv = globalThis?.parent?.__APP_ENV__
  if (parentEnv?.SUPABASE_URL && parentEnv?.SUPABASE_ANON) return parentEnv

  return {}
}

const appEnv = readAppEnv()
const supabaseUrl = appEnv.SUPABASE_URL || ''
const supabaseAnonKey = appEnv.SUPABASE_ANON || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configuração Supabase ausente. Defina SUPABASE_URL e SUPABASE_ANON em apps/web/env.js')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://lppwjigmzroedjnctneb.supabase.co'
const supabaseAnonKey = 'COLOCAR_ANON_KEY_AQUI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

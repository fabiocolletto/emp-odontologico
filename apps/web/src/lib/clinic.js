import { supabase } from './supabaseClient.js'

export async function getActiveClinic() {
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return null

  const { data, error } = await supabase
    .from('odf_user_profiles')
    .select('last_active_clinic_id')
    .eq('user_id', user.user.id)
    .single()

  if (error) throw error

  return data?.last_active_clinic_id
}

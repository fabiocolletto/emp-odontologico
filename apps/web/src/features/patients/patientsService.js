import { supabase } from '../../lib/supabaseClient.js'
import { getActiveClinic } from '../../lib/clinic.js'

export async function getPatients() {
  const clinicId = await getActiveClinic()
  if (!clinicId) return []

  const { data, error } = await supabase
    .from('odf_patients')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

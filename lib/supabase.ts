import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pyywrxrmtehucmkpqkdi.supabase.co'
const supabaseKey = 'sb_publishable_Ztie93n2pi48h_rAIuviyA_ftjAIDuj'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  }
})

export default supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://czukwelvdcmkqdvfxypz.supabase.co'
const supabaseKey = 'sb_publishable_Z4FMqHflL1ByUNmpS4ZYoA_W6rc8W54'

export const supabase = createClient(supabaseUrl, supabaseKey)

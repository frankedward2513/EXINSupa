import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Add the "export" keyword here
export interface UserRecord {
  id: string;
  cus_name: string;
  cus_gmail: string;
  cus_password?: string;
  cus_sddress?: string;
  cus_role: 'customer' | 'staff' | 'admin';
  created_at: string;
}


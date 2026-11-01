import { createClient } from '@supabase/supabase-js';

// These are Supabase project URL + publishable key.
// Publishable keys are intended for client-side apps; never put service_role keys here.
const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  'https://jeshuixkuwvuydchcihy.supabase.co';

const publishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'sb_publishable_IjwzwKkQMPxNpt-qXUaH9w_i2Gve_Cl';

export const supabase = createClient(url, publishableKey);

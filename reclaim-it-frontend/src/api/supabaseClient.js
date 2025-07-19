
// src/api/supabaseClient.js
import { createClient } from "@supabase/supabase-js";



const SUPABASE_URL  = "https://dchelwrfqsmzfgnfcmxs.supabase.co";
const SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjaGVsd3JmcXNtemZnbmZjbXhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc5MjQzMSwiZXhwIjoyMDY4MzY4NDMxfQ.23ROtFYuEOCYqdzjuOcNFVlQuEsSq20jmUuUfmfuOSk";


export const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

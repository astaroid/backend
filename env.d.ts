/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_KEY: string
  readonly VITE_SUPABASE_SECRET_KEY: string
}
  
interface ImportMeta {
  readonly env: ImportMetaEnv
}
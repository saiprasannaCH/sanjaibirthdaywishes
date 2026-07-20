/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RECIPIENT_NAME: string;
  readonly VITE_UNLOCK_AT: string;
  readonly VITE_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

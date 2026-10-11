/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_LOCATION_API_KEY?: string;
  readonly VITE_AWS_REGION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
